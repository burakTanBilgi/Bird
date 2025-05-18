// pages/api/favorites/remove.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock database connection - in a real app, you'd use a proper database client
async function removeFavoriteFromDB(buyerId: number, listingId: number) {
  // This would be a real database query like:
  // DELETE FROM buyer_favorites WHERE buyer_id = $1 AND listing_id = $2
  
  console.log(`Removing listing ${listingId} from buyer ${buyerId}'s favorites`);
  
  // Simulate database operation
  return Promise.resolve({ success: true });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { listingId } = req.body;
    
    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }

    // In a real app, you would:
    // 1. Get the current user ID from session/authentication
    // 2. Validate that the user owns this favorite
    // 3. Remove from database
    
    // For now, we'll use a hardcoded buyer ID (Baran's ID is 1)
    const buyerId = 1;
    
    await removeFavoriteFromDB(buyerId, listingId);
    
    res.status(200).json({ 
      message: 'Favorite removed successfully',
      listingId 
    });
    
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}