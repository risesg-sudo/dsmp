# File Handling & Serialization

## Table of Contents
1. [File Basics](#file-basics)
2. [Reading Files](#reading-files)
3. [Writing Files](#writing-files)
4. [File Modes](#file-modes)
5. [Working with Paths](#working-with-paths)
6. [CSV Files](#csv-files)
7. [JSON Serialization](#json-serialization)
8. [Pickle Serialization](#pickle-serialization)
9. [Context Managers](#context-managers)
10. [Common Pitfalls](#common-pitfalls)
11. [Interview Questions](#interview-questions)

---

## File Basics

File handling allows you to create, read, update, and delete files.

```
┌─────────────────────────────────────┐
│     File Operations Flow            │
├─────────────────────────────────────┤
│  1. Open file                       │
│     file = open('name.txt', 'r')    │
│                                     │
│  2. Perform operations              │
│     content = file.read()           │
│                                     │
│  3. Close file                      │
│     file.close()                    │
└─────────────────────────────────────┘

Better approach: Use context manager (with)
```

### Basic File Operations

```python
# Open and close manually (not recommended)
file = open('example.txt', 'r')
content = file.read()
file.close()

# Using context manager (recommended)
with open('example.txt', 'r') as file:
    content = file.read()
# File automatically closed after with block
```

---

## Reading Files

### Read Entire File

```python
# Read all content as string
with open('data.txt', 'r') as file:
    content = file.read()
    print(content)

# Read with size limit (bytes)
with open('data.txt', 'r') as file:
    content = file.read(100)  # Read first 100 characters
    print(content)
```

### Read Line by Line

```python
# Read one line
with open('data.txt', 'r') as file:
    line = file.readline()
    print(line)

# Read all lines as list
with open('data.txt', 'r') as file:
    lines = file.readlines()
    for line in lines:
        print(line.strip())  # Remove trailing newline

# Iterate over file object (memory efficient)
with open('data.txt', 'r') as file:
    for line in file:
        print(line.strip())
```

### Real-World Example: Log File Analysis

```python
def analyze_log_file(filename):
    """Analyze server log file"""
    error_count = 0
    warning_count = 0
    info_count = 0

    with open(filename, 'r') as file:
        for line in file:
            line = line.strip()
            if 'ERROR' in line:
                error_count += 1
            elif 'WARNING' in line:
                warning_count += 1
            elif 'INFO' in line:
                info_count += 1

    return {
        'errors': error_count,
        'warnings': warning_count,
        'info': info_count
    }

# Usage
# stats = analyze_log_file('server.log')
# print(f"Errors: {stats['errors']}")
```

---

## Writing Files

### Write to File

```python
# Write (overwrites existing file)
with open('output.txt', 'w') as file:
    file.write("Hello, World!\n")
    file.write("This is a new line.\n")

# Write multiple lines
lines = ['Line 1\n', 'Line 2\n', 'Line 3\n']
with open('output.txt', 'w') as file:
    file.writelines(lines)

# Append to file
with open('output.txt', 'a') as file:
    file.write("This is appended.\n")
```

### Real-World Example: Report Generator

```python
def generate_report(data, filename):
    """Generate a text report from data"""
    with open(filename, 'w') as file:
        # Write header
        file.write("=" * 50 + "\n")
        file.write("SALES REPORT\n")
        file.write("=" * 50 + "\n\n")

        # Write data
        total = 0
        for item, price in data.items():
            file.write(f"{item:<30} ₹{price:>10.2f}\n")
            total += price

        # Write footer
        file.write("\n" + "-" * 50 + "\n")
        file.write(f"{'TOTAL':<30} ₹{total:>10.2f}\n")
        file.write("=" * 50 + "\n")

# Usage
sales_data = {
    'Product A': 1250.50,
    'Product B': 2340.00,
    'Product C': 890.75
}
generate_report(sales_data, 'sales_report.txt')
```

---

## File Modes

```python
# Read modes
'r'   # Read (default) - Error if file doesn't exist
'rb'  # Read binary
'r+'  # Read and write

# Write modes
'w'   # Write (overwrites existing file)
'wb'  # Write binary
'w+'  # Write and read (overwrites)

# Append modes
'a'   # Append (create if doesn't exist)
'ab'  # Append binary
'a+'  # Append and read

# Exclusive creation
'x'   # Create (error if exists)
```

### Mode Examples

```python
# Read mode - file must exist
try:
    with open('nonexistent.txt', 'r') as file:
        content = file.read()
except FileNotFoundError:
    print("File not found!")

# Write mode - overwrites file
with open('output.txt', 'w') as file:
    file.write("This overwrites everything")

# Append mode - adds to end
with open('output.txt', 'a') as file:
    file.write("\nThis is appended")

# Exclusive mode - creates only if doesn't exist
try:
    with open('newfile.txt', 'x') as file:
        file.write("New file created")
except FileExistsError:
    print("File already exists!")

# Read and write mode
with open('data.txt', 'r+') as file:
    content = file.read()
    file.write("\nNew content added")
```

---

## Working with Paths

### os.path Module

```python
import os

# Join paths (cross-platform)
path = os.path.join('folder', 'subfolder', 'file.txt')
print(path)  # folder/subfolder/file.txt (or folder\subfolder\file.txt on Windows)

# Check if path exists
exists = os.path.exists('data.txt')
print(exists)

# Check if it's a file or directory
is_file = os.path.isfile('data.txt')
is_dir = os.path.isdir('myfolder')

# Get absolute path
abs_path = os.path.abspath('data.txt')
print(abs_path)

# Get directory and filename
path = '/home/user/documents/file.txt'
directory = os.path.dirname(path)   # /home/user/documents
filename = os.path.basename(path)   # file.txt

# Split extension
name, ext = os.path.splitext('document.pdf')
print(name, ext)  # document .pdf

# Get file size
size = os.path.getsize('data.txt')
print(f"Size: {size} bytes")
```

### pathlib Module (Modern Approach)

```python
from pathlib import Path

# Create Path object
path = Path('data.txt')

# Check if exists
if path.exists():
    print("File exists")

# Read file
content = path.read_text()
print(content)

# Write file
path.write_text("Hello, World!")

# Create directory
new_dir = Path('new_folder')
new_dir.mkdir(exist_ok=True)  # Don't error if exists

# Join paths
full_path = Path('folder') / 'subfolder' / 'file.txt'
print(full_path)

# Get parts
print(path.name)        # file.txt
print(path.stem)        # file
print(path.suffix)      # .txt
print(path.parent)      # parent directory

# Iterate over directory
directory = Path('.')
for file in directory.iterdir():
    if file.is_file():
        print(file.name)

# Glob pattern matching
for txt_file in directory.glob('*.txt'):
    print(txt_file)
```

### Real-World Example: File Organizer

```python
from pathlib import Path
import shutil

def organize_files(directory):
    """Organize files by extension"""
    path = Path(directory)

    # Create folders for each extension
    for file in path.iterdir():
        if file.is_file():
            ext = file.suffix.lower()
            if ext:
                # Create folder for extension
                folder = path / ext[1:]  # Remove dot
                folder.mkdir(exist_ok=True)

                # Move file
                new_path = folder / file.name
                if not new_path.exists():
                    shutil.move(str(file), str(new_path))
                    print(f"Moved {file.name} to {folder}")

# Usage (commented to avoid actual execution)
# organize_files('downloads')
```

---

## CSV Files

CSV (Comma-Separated Values) files are common for tabular data.

### Reading CSV

```python
import csv

# Basic reading
with open('data.csv', 'r') as file:
    csv_reader = csv.reader(file)

    # Skip header
    header = next(csv_reader)

    for row in csv_reader:
        print(row)  # Each row is a list

# Read as dictionary
with open('data.csv', 'r') as file:
    csv_reader = csv.DictReader(file)

    for row in csv_reader:
        print(row)  # Each row is a dictionary
        print(row['Name'], row['Age'])
```

### Writing CSV

```python
import csv

# Basic writing
data = [
    ['Name', 'Age', 'City'],
    ['Alice', 25, 'New York'],
    ['Bob', 30, 'Los Angeles'],
    ['Charlie', 35, 'Chicago']
]

with open('output.csv', 'w', newline='') as file:
    csv_writer = csv.writer(file)
    csv_writer.writerows(data)

# Write from dictionaries
data = [
    {'Name': 'Alice', 'Age': 25, 'City': 'New York'},
    {'Name': 'Bob', 'Age': 30, 'City': 'Los Angeles'}
]

with open('output.csv', 'w', newline='') as file:
    fieldnames = ['Name', 'Age', 'City']
    csv_writer = csv.DictWriter(file, fieldnames=fieldnames)

    csv_writer.writeheader()
    csv_writer.writerows(data)
```

### Real-World Example: Student Records

```python
import csv

class StudentDatabase:
    def __init__(self, filename):
        self.filename = filename

    def add_student(self, name, age, grade):
        """Add a student to CSV file"""
        with open(self.filename, 'a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([name, age, grade])

    def get_all_students(self):
        """Get all students from CSV file"""
        students = []
        with open(self.filename, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                students.append(row)
        return students

    def get_average_grade(self):
        """Calculate average grade"""
        students = self.get_all_students()
        if not students:
            return 0

        total = sum(float(s['Grade']) for s in students)
        return total / len(students)

# Usage (create file first with header)
# with open('students.csv', 'w', newline='') as f:
#     writer = csv.writer(f)
#     writer.writerow(['Name', 'Age', 'Grade'])

# db = StudentDatabase('students.csv')
# db.add_student('Alice', 20, 85)
# db.add_student('Bob', 22, 90)
# print(f"Average grade: {db.get_average_grade():.2f}")
```

---

## JSON Serialization

JSON (JavaScript Object Notation) is a lightweight data interchange format.

### Reading JSON

```python
import json

# Read from file
with open('data.json', 'r') as file:
    data = json.load(file)
    print(data)

# Parse JSON string
json_string = '{"name": "Alice", "age": 25, "city": "New York"}'
data = json.loads(json_string)
print(data['name'])  # Alice
```

### Writing JSON

```python
import json

# Python object to JSON file
data = {
    'name': 'Alice',
    'age': 25,
    'city': 'New York',
    'hobbies': ['reading', 'gaming', 'coding']
}

# Write to file
with open('output.json', 'w') as file:
    json.dump(data, file, indent=4)  # indent for pretty printing

# Convert to JSON string
json_string = json.dumps(data, indent=2)
print(json_string)
```

### Advanced JSON Features

```python
import json
from datetime import datetime

# Custom serialization for non-serializable objects
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

data = {
    'name': 'Alice',
    'created_at': datetime.now()
}

# Serialize with custom encoder
json_string = json.dumps(data, cls=DateTimeEncoder, indent=2)
print(json_string)

# Pretty printing
data = {'a': 1, 'b': [2, 3, 4], 'c': {'d': 5}}

# Compact
print(json.dumps(data))
# {"a": 1, "b": [2, 3, 4], "c": {"d": 5}}

# Pretty
print(json.dumps(data, indent=2, sort_keys=True))
# {
#   "a": 1,
#   "b": [2, 3, 4],
#   "c": {
#     "d": 5
#   }
# }
```

### Real-World Example: Configuration Manager

```python
import json
from pathlib import Path

class ConfigManager:
    def __init__(self, config_file='config.json'):
        self.config_file = Path(config_file)
        self.config = self.load_config()

    def load_config(self):
        """Load configuration from file"""
        if self.config_file.exists():
            with open(self.config_file, 'r') as file:
                return json.load(file)
        return self.get_default_config()

    def get_default_config(self):
        """Return default configuration"""
        return {
            'database': {
                'host': 'localhost',
                'port': 5432,
                'name': 'mydb'
            },
            'api': {
                'key': '',
                'timeout': 30
            },
            'logging': {
                'level': 'INFO',
                'file': 'app.log'
            }
        }

    def save_config(self):
        """Save configuration to file"""
        with open(self.config_file, 'w') as file:
            json.dump(self.config, file, indent=4)

    def get(self, key, default=None):
        """Get configuration value"""
        keys = key.split('.')
        value = self.config

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default

        return value if value is not None else default

    def set(self, key, value):
        """Set configuration value"""
        keys = key.split('.')
        config = self.config

        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value
        self.save_config()

# Usage
config = ConfigManager()
print(config.get('database.host'))  # localhost
config.set('database.port', 3306)
config.set('api.key', 'secret-key-123')
```

---

## Pickle Serialization

Pickle serializes Python objects to binary format.

```python
import pickle

# Serialize (save) object
data = {
    'name': 'Alice',
    'age': 25,
    'scores': [85, 90, 92]
}

# Write to file
with open('data.pkl', 'wb') as file:
    pickle.dump(data, file)

# Read from file
with open('data.pkl', 'rb') as file:
    loaded_data = pickle.load(file)
    print(loaded_data)

# Serialize to bytes
pickled = pickle.dumps(data)
print(type(pickled))  # <class 'bytes'>

# Deserialize from bytes
unpickled = pickle.loads(pickled)
print(unpickled)
```

### Pickle vs JSON

```python
"""
JSON:
- Human-readable
- Language-agnostic
- Limited data types (str, int, float, bool, list, dict, None)
- Safer (no code execution)

Pickle:
- Binary format
- Python-specific
- Supports all Python objects
- Can execute code (security risk!)
- Faster for large/complex objects
"""

# Example: Custom objects
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

person = Person('Alice', 25)

# Pickle works
with open('person.pkl', 'wb') as f:
    pickle.dump(person, f)

with open('person.pkl', 'rb') as f:
    loaded_person = pickle.load(f)
    print(loaded_person)  # Person('Alice', 25)

# JSON doesn't work directly
import json
try:
    json.dumps(person)
except TypeError as e:
    print(f"JSON error: {e}")
```

---

## Context Managers

Context managers handle resource allocation and deallocation automatically.

### Using with Statement

```python
# Without context manager (not recommended)
file = open('data.txt', 'r')
try:
    content = file.read()
finally:
    file.close()  # Must close manually

# With context manager (recommended)
with open('data.txt', 'r') as file:
    content = file.read()
# Automatically closed

# Multiple context managers
with open('input.txt', 'r') as infile, open('output.txt', 'w') as outfile:
    content = infile.read()
    outfile.write(content.upper())
```

### Creating Custom Context Manager

```python
# Using class
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        """Called when entering with block"""
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Called when exiting with block"""
        if self.file:
            self.file.close()
        # Return True to suppress exceptions
        return False

# Usage
with FileManager('data.txt', 'r') as file:
    content = file.read()

# Using contextlib
from contextlib import contextmanager

@contextmanager
def file_manager(filename, mode):
    """Context manager using generator"""
    file = open(filename, mode)
    try:
        yield file
    finally:
        file.close()

# Usage
with file_manager('data.txt', 'r') as file:
    content = file.read()
```

### Real-World Example: Database Connection

```python
from contextlib import contextmanager
import sqlite3

@contextmanager
def database_connection(db_name):
    """Context manager for database connections"""
    conn = None
    try:
        conn = sqlite3.connect(db_name)
        print("Database connection opened")
        yield conn
        conn.commit()
        print("Changes committed")
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        if conn:
            conn.close()
            print("Database connection closed")

# Usage (example only)
# with database_connection('mydb.db') as conn:
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM users")
#     results = cursor.fetchall()
```

---

## Common Pitfalls

### 1. Not Closing Files

```python
# ❌ Wrong - file may not close if exception occurs
file = open('data.txt', 'r')
content = file.read()
file.close()

# ✓ Correct - always use context manager
with open('data.txt', 'r') as file:
    content = file.read()
```

### 2. Forgetting newline='' in CSV

```python
# ❌ Wrong - extra blank lines in output
with open('data.csv', 'w') as file:
    writer = csv.writer(file)
    writer.writerow(['a', 'b'])

# ✓ Correct
with open('data.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['a', 'b'])
```

### 3. Text vs Binary Mode

```python
# ❌ Wrong - trying to write string in binary mode
with open('data.txt', 'wb') as file:
    file.write("Hello")  # TypeError!

# ✓ Correct
with open('data.txt', 'wb') as file:
    file.write(b"Hello")  # Bytes

# Or use text mode
with open('data.txt', 'w') as file:
    file.write("Hello")  # String
```

### 4. Relative vs Absolute Paths

```python
# Relative path (depends on current directory)
with open('data.txt', 'r') as file:
    pass

# Absolute path (always works)
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, 'data.txt')
with open(file_path, 'r') as file:
    pass
```

---

## Interview Questions

### Q1: What's the difference between 'r' and 'r+' modes?

**Answer:**
- `'r'`: Read-only, file must exist
- `'r+'`: Read and write, file must exist, doesn't truncate

### Q2: How to read a large file efficiently?

```python
# Don't load entire file into memory
with open('large_file.txt', 'r') as file:
    for line in file:  # Reads line by line
        process(line)

# Or use chunks
def read_in_chunks(file_path, chunk_size=1024):
    with open(file_path, 'r') as file:
        while True:
            chunk = file.read(chunk_size)
            if not chunk:
                break
            yield chunk
```

### Q3: JSON vs Pickle - when to use what?

**Answer:**
- **JSON**: Human-readable, cross-language, web APIs, configuration
- **Pickle**: Python-specific, complex objects, faster, NOT for untrusted data

### Q4: How to handle file encoding issues?

```python
# Specify encoding explicitly
with open('data.txt', 'r', encoding='utf-8') as file:
    content = file.read()

# Handle errors
with open('data.txt', 'r', encoding='utf-8', errors='ignore') as file:
    content = file.read()
```

### Q5: Implement a file copy function

```python
def copy_file(source, destination, chunk_size=1024):
    """Copy file in chunks"""
    with open(source, 'rb') as src, open(destination, 'wb') as dst:
        while True:
            chunk = src.read(chunk_size)
            if not chunk:
                break
            dst.write(chunk)

# Or use shutil
import shutil
shutil.copy('source.txt', 'destination.txt')
```

---

## Practice Problems

1. **Word Counter**: Count words in a text file and find the most common words.

2. **CSV Merger**: Merge multiple CSV files into one.

3. **JSON Config Editor**: Create a command-line tool to edit JSON configuration files.

4. **Log File Parser**: Parse log files and extract specific information.

5. **File Backup System**: Create a system to backup files with timestamps.

---

**End of File Handling & Serialization - Happy Learning! 🐍**
