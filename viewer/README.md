# DSMP 2.0 Revision Notes Viewer

A comprehensive web application for reading and tracking progress through DSMP 2.0 revision notes with advanced scroll tracking, analytics, and progress management.

## Features

### 📊 Advanced Scroll Tracking

- **Real-time scroll position tracking** - Monitors your exact position in each document
- **Percentage-based progress** - Shows completion percentage for each document
- **Milestone tracking** - Tracks when you reach 0%, 25%, 50%, 75%, and 100% of each document
- **Active reading time** - Tracks actual time spent actively reading (excludes idle time)
- **Session management** - Maintains session data across browser sessions
- **Auto-save** - Automatically saves progress every 3 seconds
- **Scroll speed analytics** - Monitors reading speed and patterns

### 📈 Progress Visualization

- **Top progress bar** - Shows real-time scroll percentage
- **Scroll indicator** - Visual indicator on the right side showing position
- **Navigation badges** - Each document shows completion percentage
- **Category completion tracking** - Track progress by topic category
- **Color-coded status** - Completed (green), In Progress (orange), Not Started (gray)

### 📚 Reading Analytics

- **Comprehensive dashboard** - View all your reading statistics
- **Category breakdown** - See progress by topic (Python, SQL, ML, etc.)
- **Reading streaks** - Track consecutive days of reading
- **Document history** - See recently read documents
- **Time tracking** - Total and average reading time per document
- **Completion rates** - Overall completion percentage
- **Export data** - Download your progress as JSON

### 🎯 User Experience

- **Responsive design** - Works on desktop, tablet, and mobile
- **Dark theme** - Easy on the eyes for long reading sessions
- **Search functionality** - Quickly find documents by name
- **Collapsible categories** - Organize your navigation
- **Markdown rendering** - Beautiful rendering with syntax highlighting
- **Keyboard shortcuts** - Quick access to common features

## Getting Started

### Installation

1. **Clone or download this repository**

2. **Open the viewer**
   - Simply open `index.html` in a modern web browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000

     # Node.js (with http-server)
     npx http-server
     ```
   - Navigate to `http://localhost:8000`

3. **Start reading!**
   - Select a topic from the sidebar
   - Your progress will be automatically tracked
   - Close and reopen - your progress is saved!

### Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage enabled (for saving progress)

## How It Works

### Scroll Tracking

The viewer tracks multiple metrics while you read:

1. **Scroll Position**: Your exact position in pixels
2. **Scroll Percentage**: How far through the document (0-100%)
3. **Max Scroll**: The furthest point you've reached
4. **Milestones**: Specific checkpoints (25%, 50%, 75%, 100%)
5. **Reading Time**: Active time spent reading
6. **Session Data**: Timestamps and session information

### Progress Persistence

All progress is saved to localStorage:

```javascript
{
  "documents": {
    "path/to/document.md": {
      "scrollPosition": 1500,
      "scrollPercentage": 75.5,
      "maxScrollPercentage": 75.5,
      "milestonesReached": [0, 25, 50, 75],
      "activeReadingTime": 180000,  // 3 minutes
      "completed": false,
      "lastViewed": 1699999999999
    }
  },
  "analytics": {
    "totalReadingTime": 3600000,  // 1 hour
    "documentsCompleted": 5,
    "currentStreak": 3  // days
  }
}
```

### Tracking Events

The scroll tracker emits events for integration:

- `trackingStarted` - Document tracking begins
- `scroll` - User scrolls (throttled)
- `milestoneReached` - Reached 25%, 50%, 75%, or 100%
- `documentCompleted` - Reached the end
- `userIdle` - No activity for 30 seconds
- `progressSaved` - Data saved to localStorage
- `trackingStopped` - Tracking ended

## Features in Detail

### 1. Progress Bar

The top progress bar shows:
- Blue gradient fill indicating scroll percentage
- Percentage number on the right
- Smooth animations as you scroll

### 2. Scroll Indicator

The right-side indicator shows:
- Your current position in the document
- Smooth tracking dot that follows your scroll
- Only visible when hovering over content

### 3. Navigation Sidebar

Features:
- **Search**: Filter documents by name
- **Categories**: Organized by topic
- **Progress badges**: Shows completion % for each document
- **Color coding**: Visual status indicators
- **Collapsible**: Click category titles to expand/collapse

### 4. Analytics Dashboard

Click "📊 Stats" to see:
- Documents read count
- Completion rate
- Total reading time
- Current and longest streaks
- Category-wise breakdown
- Recently read documents
- Detailed statistics
- Storage usage

### 5. Session Timer

Top-right timer shows:
- Active reading time for current session
- Pauses when you stop scrolling
- Resets when switching documents

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search
- `Ctrl/Cmd + S` - Show analytics dashboard
- `Escape` - Close modal/dialog

## Data Management

### Export Your Data

1. Click "📊 Stats" button
2. Click "📥 Export Data"
3. Downloads JSON file with all progress

### Import Data

Currently, you can export data for backup. To import:
1. Open browser console (F12)
2. Run: `storageManager.importData(jsonString)`

### Clear All Data

⚠️ **Warning**: This permanently deletes all progress!

1. Click "📊 Stats" button
2. Click "🗑️ Clear All Data"
3. Confirm the action

## Technical Details

### Architecture

```
viewer/
├── index.html              # Main HTML structure
├── styles.css              # All styling (dark theme)
├── app.js                  # Main application logic
├── scroll-tracker.js       # Scroll tracking system
├── storage-manager.js      # LocalStorage management
├── analytics.js            # Analytics and stats
└── README.md              # This file
```

### Dependencies

External libraries (loaded from CDN):
- **Marked.js** v11.1.0 - Markdown parsing
- **Highlight.js** v11.9.0 - Code syntax highlighting

### Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Storage Limits

- LocalStorage limit: ~5-10MB (browser dependent)
- Current usage: Typically < 1MB
- Automatic cleanup: Removes old sessions if needed

## Customization

### Modify Tracking Settings

Edit `scroll-tracker.js`:

```javascript
window.scrollTracker = new ScrollTracker({
    throttleMs: 100,           // Scroll event throttle
    saveInterval: 3000,        // Auto-save interval
    milestones: [0, 25, 50, 75, 100],  // Milestone percentages
    minScrollSpeed: 50,        // Min speed for active reading
    idleTimeout: 30000,        // Idle timeout (30 seconds)
    restorePosition: false     // Restore scroll on reload
});
```

### Change Theme Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2563eb;      /* Blue */
    --success-color: #10b981;      /* Green */
    --bg-primary: #0f172a;         /* Dark blue-gray */
    /* ... more colors ... */
}
```

### Add More Documents

Edit `app.js` in the `loadDocumentStructure()` method:

```javascript
this.documentStructure = {
    'Your Category': [
        { name: 'Document Name', path: '../path/to/file.md' }
    ]
};
```

## Troubleshooting

### Progress Not Saving

1. Check if localStorage is enabled
2. Check browser console for errors
3. Verify storage quota not exceeded
4. Try clearing old data

### Documents Not Loading

1. Verify file paths are correct
2. Check browser console for 404 errors
3. Ensure you're using a web server (not file://)
4. Check CORS settings if using external server

### Scroll Tracking Not Working

1. Verify JavaScript is enabled
2. Check browser console for errors
3. Ensure modern browser (see compatibility)
4. Try hard refresh (Ctrl+Shift+R)

## Future Enhancements

Planned features:
- [ ] Backend API for multi-device sync
- [ ] User accounts and authentication
- [ ] Reading goals and reminders
- [ ] Note-taking and highlighting
- [ ] Export to PDF with highlights
- [ ] Reading recommendations
- [ ] Mobile app versions
- [ ] Offline PWA support

## Contributing

Suggestions and improvements welcome! This is a learning tool designed to help DSMP students track their revision progress.

## License

Free to use for educational purposes.

---

**Happy Learning! 📚**

Built with ❤️ for DSMP 2.0 students
