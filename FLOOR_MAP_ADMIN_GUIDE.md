# Floor Map Admin Mode - Desk Repositioning Guide

## Overview

The Floor Map now includes an **Admin Mode** feature that allows administrators to drag and reposition desks on the floor map, with automatic synchronization to the backend database.

## Features

### ✨ Key Capabilities

1. **Drag-and-Drop Repositioning**: Click and drag desk shapes to new positions on the floor map
2. **Real-time Coordinate Updates**: As you drag, coordinates are displayed (as percentage of floor width/height)
3. **Automatic Backend Sync**: When you release the mouse, coordinates are automatically sent to the backend
4. **Visual Feedback**: 
   - Color-coded desks (red = occupied, green = available)
   - Golden border highlight when dragging
   - Coordinate display showing exact position percentages
   - Cursor changes to "grab" when hovering (in admin mode)
   - Cursor changes to "grabbing" while dragging

5. **Admin Authentication**: Password-protected admin mode to prevent accidental modifications

## How to Use

### Entering Admin Mode

1. Navigate to the **Workplace Utilization** page
2. Click the **"Admin Mode"** button in the top-right controls
3. Enter the admin password in the dialog box
4. Click **"Enable Admin Mode"**
   - You'll see a blue banner stating "Admin Mode - Drag desks to reposition"
   - The Admin Mode button will turn blue
   - An **"Add Desk"** button will appear next to it

### Repositioning Desks

1. **While in Admin Mode**, hover over any desk shape on the floor map
   - The desk will be highlighted with a golden border
   - The cursor changes to a "grab" icon

2. **Click and drag** the desk to the new position
   - A preview shows the desk moving with your mouse
   - Coordinates are displayed below the desk label (as percentages)
   - The desk stays semi-transparent while dragging for clarity

3. **Release the mouse** to drop the desk in the new position
   - The coordinates are automatically saved to the backend
   - The desk snaps to the final position
   - A small delete button (red X) appears when you hover over the desk

### Adding New Desks

1. **While in Admin Mode**, click the **"Add Desk"** button (green with + icon)
2. A new desk will appear in the center of the floor map
3. Drag it to the desired location
4. The new desk ID is auto-generated (MZ001, MZ002, etc.)

### Deleting Desks

1. **While in Admin Mode**, hover over the desk you want to delete
2. A **red delete button** (X) appears in the top-right corner of the desk
3. Click the red X to delete the desk
4. A confirmation dialog will appear - click "OK" to confirm deletion

## Technical Implementation

### Architecture

```
User Interface (Floor Map)
    ↓
    ├─→ FloorMapImage Component (with drag-drop handlers)
    ├─→ Workplace Utilization Page (admin mode toggle)
    ↓
Services Layer
    ├─→ updateDeskCoordinates() - Syncs to backend
    ↓
Backend (Microsoft Dataverse)
    └─→ Updates desk entity with new xN, yN coordinates
```

### Coordinate System

Desks are stored using **normalized coordinates** (0-1 scale):
- **xN**: Horizontal position (0 = left edge, 1 = right edge)
- **yN**: Vertical position (0 = top edge, 1 = bottom edge)

This normalized system allows the floor map to scale responsively without coordinate recalculation.

### Important: SVG Coordinate Mapping

The floor map uses an SVG with `preserveAspectRatio="xMidYMid meet"`, which means:
- The SVG maintains its aspect ratio
- Content is centered within the container
- Coordinate calculations account for this centering automatically
- You can drag desks smoothly without them jumping or disappearing

### Files Modified/Created

1. **[src/components/floor-map-image.tsx](src/components/floor-map-image.tsx)**
   - Added `isAdminMode` prop for drag-drop functionality
   - Added `onDeskCoordinatesChange` callback prop
   - Implemented mouse event handlers (mousedown, mousemove, mouseup)
   - Added drag state management with preview positioning
   - Enhanced visual feedback (glowing border, coordinate display)

2. **[src/services/deskCoordinatesService.ts](src/services/deskCoordinatesService.ts)** (new)
   - `updateDeskCoordinates()` - Sync single desk coordinates to backend
   - `batchUpdateDeskCoordinates()` - Sync multiple desks at once
   - API error handling with graceful fallback for development

3. **[src/app/workplace-utilization/page.tsx](src/app/workplace-utilization/page.tsx)**
   - Added admin mode state management
   - Added password verification logic
   - Added admin password dialog UI
   - Connected FloorMapImage to receive admin mode state

## Security

### Password Protection

Currently uses a hardcoded password for development:
```typescript
const ADMIN_PASSWORD = 'admin123'
```

⚠️ **For Production**: Replace with:
- Azure AD authentication
- Role-based access control (RBAC)
- API key authentication
- Multi-factor authentication (MFA)

### Backend Integration

Update the service calls in `deskCoordinatesService.ts` to connect with your actual API endpoints:

```typescript
// Current (development):
const response = await fetch('/api/desks/update-coordinates', {
  method: 'POST',
  body: JSON.stringify(payload),
});

// Production (example with Microsoft Dataverse):
const result = await MicrosoftDataverseService.UpdateEntity('desks', deskId, {
  'xN': xN,
  'yN': yN,
  'last_modified': new Date().toISOString()
});
```

## API Endpoints Required

Your backend should expose these endpoints:

### Single Desk Update
```
POST /api/desks/update-coordinates
Body: {
  deskId: string,      // e.g., "MZ001"
  xN: number,          // 0-1
  yN: number,          // 0-1
  timestamp: string    // ISO 8601
}
Response: {
  success: boolean,
  message: string
}
```

### Batch Update
```
POST /api/desks/batch-update-coordinates
Body: {
  updates: [
    { deskId, xN, yN },
    ...
  ],
  timestamp: string
}
Response: {
  success: boolean,
  message: string
}
```

## Development Notes

### Desks Dataset

Desks are generated in `generateMZ001to078()` with:
- **78 total desks** (MZ001 to MZ078)
- Normalized coordinates (xN, yN) in 0-1 range
- Zone classification (Left Wing, Right Wing, South Zone)
- Occupancy status (occupied/available)
- Optional user assignment with time slots

### Testing Drag-Drop

1. Enable admin mode with password `admin123`
2. Hover over any desk to see highlight
3. Drag desk to new position
4. Check browser console for sync logs:
   ```
   Updating desk coordinates: {deskId: "MZ001", xN: 0.35, yN: 0.42, ...}
   ```

## Future Enhancements

- [ ] Snap-to-grid functionality for aligned placement
- [ ] Batch move multiple desks at once (Shift+Click multi-select)
- [ ] Undo/Redo capability for recent changes
- [ ] Save/load desk layout configurations
- [ ] Export desk positions to CSV/Excel
- [ ] Floor map image upload capability
- [ ] Desk size customization (resize handles)
- [ ] Collision detection to prevent overlapping desks
- [ ] Keyboard shortcuts for admin operations (Delete key to remove)
- [ ] Desk grouping/layering for complex layouts
- [ ] Zone/area creation and editing
- [ ] Copy/paste desk configurations

## Troubleshooting

### Coordinates not updating?
1. Check browser console for errors
2. Verify backend API is accessible (or implement mock endpoints)
3. Check admin mode is enabled (blue banner visible)
4. Verify desk coordinates service is imported
5. Make sure you release the mouse button (don't hold)

### Desks not draggable or disappearing when clicked?
1. **Ensure admin mode is enabled** - the blue button should be highlighted
2. Check that `isAdminMode={true}` is passed to FloorMapImage component
3. Verify you're hovering first (golden border should appear) before dragging
4. **The desk should NOT disappear** - if it does, check for coordinate calculation errors
5. **Fixed in v1.1**: SVG coordinate mapping now properly accounts for `preserveAspectRatio` centering

### Can't add or delete desks?
1. Verify admin mode is enabled
2. For adding: Look for the green "Add Desk" button - appears next to "Admin Mode" when admin mode is on
3. For deleting: Hover over a desk, a red X button should appear in its top-right corner
4. Click the red X and confirm the deletion dialog

### Password dialog not appearing?
1. Clear browser cache and refresh (Ctrl+Shift+R)
2. Check that `showAdminPasswordDialog` state is updating
3. Verify Card component is rendering properly
4. Default password is `admin123` - change this for production!

### Desks overlapping after drag?
1. This is expected behavior - no collision detection yet
2. Drag desks to non-overlapping positions manually
3. Future enhancement: automatic collision detection

### Smooth dragging issues?
1. The coordinate system now accounts for SVG aspect ratio and centering
2. If desks still jump, check browser console for JavaScript errors
3. Verify the SVG viewBox attribute is "0 0 1 1"

## Recent Fixes & Updates (v1.2.1)

### ✅ Fixed: Far Edge Accessibility (v1.2.1)
- **Problem**: Could not drag desks to far left and right edges of the floor map
- **Root Cause**: Coordinate clamping range (0-1) was too restrictive, preventing desk centers from reaching edges
- **Solution**: Expanded clamping range to -0.02 to 1.02 to accommodate desk width
- **Result**: Desks can now be positioned fully against all edges (left, right, top, bottom)

### ✅ Fixed: Tooltip Positioning and Edge Accessibility (v1.2.0)
- **Problem**: Tooltips appeared far from desks; desks near walls were inaccessible
- **Solution**: 
  - Repositioned tooltip to follow desk coordinates precisely
  - Changed container `overflow: auto` to `overflow: hidden` for full viewport access
  - Tooltip now calculates pixel position based on desk location
- **Result**: Tooltips appear directly above desks; all desks accessible including those near edges

### ✅ Fixed: Y-Axis Coordinate Inversion (v1.1.0)
- **Problem**: Drag direction was inverted - had to drag opposite to desired movement
- **Solution**: Updated coordinate system to match SVG rendering orientation
- **Result**: Natural, intuitive drag-and-drop in all directions

### ✅ Added: Desk Creation (v1.1.0)
- New "Add Desk" button (green with + icon) appears in admin mode
- Automatically generates new desk IDs
- New desks appear in center of floor map
- Can immediately drag to new positions

### ✅ Added: Desk Deletion (v1.1.0)
- Red delete button (X) appears when hovering over desks in admin mode
- Confirmation dialog prevents accidental deletion
- Deleted desks removed from state and backend sync

## Contact & Support

For questions or issues with the floor map admin functionality, contact the development team.

---

**Last Updated**: February 2, 2026
**Component Version**: 1.0.0
