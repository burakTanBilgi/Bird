import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Property interface
interface Property {
  id: number;
  listing_number: number;
  price: number;
  property_type: string;
  room_count: string;
  gross_area: number;
  net_area: number;
  latitude: number;
  longitude: number;
  address: string;
  neighborhood: string;
  district: string;
  city: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Property[] | { error: string, details?: any }>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get viewport bounds from query parameters
  const { 
    north, 
    south, 
    east, 
    west,
    city,
    district,
    neighborhood 
  } = req.query;

  console.log('API: Viewport parametreleri:', { north, south, east, west });
  console.log('API: Lokasyon filtreleri:', { city, district, neighborhood });

  let pool: Pool | null = null;

  try {
    // Create PostgreSQL connection pool
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    pool = new Pool({
      connectionString,
      ssl: false
    });

    // Build dynamic WHERE clause
    let whereConditions = ['latitude IS NOT NULL', 'longitude IS NOT NULL'];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Add viewport bounds if provided
    if (north && south && east && west) {
      whereConditions.push(`latitude BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      queryParams.push(parseFloat(south as string), parseFloat(north as string));
      paramIndex += 2;

      whereConditions.push(`longitude BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      queryParams.push(parseFloat(west as string), parseFloat(east as string));
      paramIndex += 2;
    }

    // Add location filters if provided
    if (city) {
      whereConditions.push(`LOWER(city) = LOWER($${paramIndex})`);
      queryParams.push(city as string);
      paramIndex++;
    }

    if (district) {
      whereConditions.push(`LOWER(district) = LOWER($${paramIndex})`);
      queryParams.push(district as string);
      paramIndex++;
    }

    if (neighborhood) {
      whereConditions.push(`LOWER(neighborhood) = LOWER($${paramIndex})`);
      queryParams.push(neighborhood as string);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Build the query
    const query = `
      SELECT
        id,
        listing_number,
        price,
        property_type,
        room_count,
        COALESCE(gross_area, 0) as gross_area,
        COALESCE(net_area, 0) as net_area,
        latitude,
        longitude,
        COALESCE(address, '') as address,
        COALESCE(neighborhood, '') as neighborhood,
        COALESCE(district, '') as district,
        COALESCE(city, '') as city
      FROM
        listings
      WHERE
        ${whereClause}
      ORDER BY id
      LIMIT 1000
    `;

    console.log('Query:', query);
    console.log('Params:', queryParams);

    // Execute query
    const { rows } = await pool.query(query, queryParams);

    console.log(`${rows.length} ilan bulundu`);

    // Return the properties
    return res.status(200).json(rows);

  } catch (error: any) {
    console.error('Database query error:', error);
    
    // Return error with details
    return res.status(500).json({
      error: 'Failed to fetch property data from database',
      details: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    });
  } finally {
    // Release the pool if it was created
    if (pool) {
      try {
        await pool.end();
        console.log('Veritabanı bağlantısı kapatıldı');
      } catch (error) {
        console.error('Error closing pool:', error);
      }
    }
  }
}