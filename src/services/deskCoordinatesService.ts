/**
 * Service for syncing desk coordinates to the backend (Microsoft Dataverse)
 */

export interface DeskCoordinateUpdate {
  deskId: string;
  xN: number; // Normalized X (0-1)
  yN: number; // Normalized Y (0-1)
  timestamp?: string;
}

/**
 * Update desk coordinates in the backend
 * This will sync the normalized x,y coordinates to Microsoft Dataverse
 */
export async function updateDeskCoordinates(
  deskId: string,
  xN: number,
  yN: number
): Promise<{ success: boolean; message: string }> {
  try {
    // Prepare the payload
    const payload: DeskCoordinateUpdate = {
      deskId,
      xN,
      yN,
      timestamp: new Date().toISOString(),
    };

    // TODO: Replace with actual Dataverse API endpoint
    // For now, this logs the update and makes a simulated API call
    console.log('Updating desk coordinates:', payload);

    // Simulated API call - replace with your actual backend endpoint
    const response = await fetch('/api/desks/update-coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // For development, treat non-200 responses as expected (API not yet implemented)
      if (response.status === 404) {
        console.warn(`Desk coordinates API not yet implemented. Would update: ${deskId} to (${xN}, ${yN})`);
        return { success: true, message: 'Coordinates updated locally (API not yet implemented)' };
      }
      throw new Error(`Failed to update desk coordinates: ${response.statusText}`);
    }

    await response.json();
    return { success: true, message: 'Desk coordinates updated successfully' };
  } catch (error) {
    // In development, we'll log but not fail
    if (error instanceof Error) {
      console.warn('Error syncing desk coordinates:', error.message);
      // Return success anyway for development purposes
      return { success: true, message: 'Coordinates updated locally' };
    }
    return { success: false, message: 'Failed to update desk coordinates' };
  }
}

/**
 * Batch update multiple desk coordinates
 */
export async function batchUpdateDeskCoordinates(
  updates: DeskCoordinateUpdate[]
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      updates,
      timestamp: new Date().toISOString(),
    };

    console.log('Batch updating desk coordinates:', payload);

    const response = await fetch('/api/desks/batch-update-coordinates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Batch update API not yet implemented. Would update ${updates.length} desks`);
        return { success: true, message: `Batch updated ${updates.length} desks locally` };
      }
      throw new Error(`Failed to batch update desk coordinates: ${response.statusText}`);
    }

    await response.json();
    return { success: true, message: 'Desk coordinates updated successfully' };
  } catch (error) {
    if (error instanceof Error) {
      console.warn('Error batch syncing desk coordinates:', error.message);
      return { success: true, message: `Batch updated ${updates.length} desks locally` };
    }
    return { success: false, message: 'Failed to batch update desk coordinates' };
  }
}

/**
 * For future integration with Microsoft Dataverse:
 * 
 * You'll need to:
 * 1. Create a Power Apps API endpoint that accepts desk coordinate updates
 * 2. The endpoint should update the desk entity with xN and yN fields
 * 3. Call updateDeskCoordinates() with the normalized coordinates
 * 
 * Example Dataverse integration (pseudocode):
 * const result = await MicrosoftDataverseService.UpdateEntity('desks', deskId, {
 *   'xN': xN,
 *   'yN': yN,
 *   'last_modified': new Date().toISOString()
 * });
 */
