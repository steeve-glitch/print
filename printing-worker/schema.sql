-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT,
    department TEXT,
    notificationFrequency TEXT DEFAULT 'instant',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blocked Periods Table
CREATE TABLE IF NOT EXISTS blocked_periods (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    period TEXT NOT NULL,
    reason TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    period TEXT NOT NULL,
    pcCount INTEGER NOT NULL,
    teacherId TEXT NOT NULL,
    teacherName TEXT,
    department TEXT,
    notes TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id)
);

-- Print Requests Table
CREATE TABLE IF NOT EXISTS print_requests (
    id TEXT PRIMARY KEY,
    documentName TEXT NOT NULL,
    googleDriveLink TEXT,
    copies INTEGER NOT NULL,
    color BOOLEAN DEFAULT 0,
    size TEXT,
    doubleSided BOOLEAN DEFAULT 0,
    neededBy TEXT,
    department TEXT,
    requesterId TEXT NOT NULL,
    requesterName TEXT,
    requesterEmail TEXT,
    status TEXT DEFAULT 'pending_hod',
    hodComment TEXT DEFAULT '',
    printerNotes TEXT DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requesterId) REFERENCES users(id)
);
