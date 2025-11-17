# Regular Expressions (RegEx)

## 📖 Table of Contents
- [Introduction](#introduction)
- [Metacharacters](#metacharacters)
- [Character Classes](#character-classes)
- [Quantifiers](#quantifiers)
- [Groups and Capturing](#groups-and-capturing)
- [Anchors and Boundaries](#anchors-and-boundaries)
- [Lookahead and Lookbehind](#lookahead-and-lookbehind)
- [Common Patterns](#common-patterns)
- [Python re Module](#python-re-module)
- [Practical Examples](#practical-examples)
- [Interview Questions](#interview-questions)

---

## Introduction

Regular expressions (regex) are patterns used to match character combinations in strings. They're essential for:
- Data validation (emails, phone numbers)
- Text processing and cleaning
- Log file parsing
- Web scraping
- Feature extraction

### Basic Syntax

```
Pattern: r'hello'
Matches: "hello" in "hello world"

Pattern: r'\d+'
Matches: One or more digits (123, 456, etc.)
```

---

## Metacharacters

### Special Characters

| Character | Description | Example | Matches |
|-----------|-------------|---------|---------|
| `.` | Any character except newline | `a.c` | "abc", "a1c", "a c" |
| `^` | Start of string | `^Hello` | "Hello world" (at start) |
| `$` | End of string | `world$` | "Hello world" (at end) |
| `*` | 0 or more repetitions | `ab*c` | "ac", "abc", "abbc" |
| `+` | 1 or more repetitions | `ab+c` | "abc", "abbc" (not "ac") |
| `?` | 0 or 1 repetition | `ab?c` | "ac", "abc" |
| `\` | Escape special char | `\.` | Literal "." |
| `|` | OR operator | `cat|dog` | "cat" or "dog" |
| `[]` | Character set | `[abc]` | "a", "b", or "c" |
| `()` | Grouping | `(ab)+` | "ab", "abab" |

### Examples

```python
import re

# . (any character)
pattern = r'h.t'
print(re.findall(pattern, "hat hit hot hut h t"))
# Output: ['hat', 'hit', 'hot', 'hut', 'h t']

# ^ (start of string)
pattern = r'^Hello'
print(re.match(pattern, "Hello world"))  # Match
print(re.match(pattern, "Say Hello"))    # No match

# $ (end of string)
pattern = r'world$'
print(re.search(pattern, "Hello world"))  # Match
print(re.search(pattern, "world Hello"))  # No match

# | (OR)
pattern = r'cat|dog'
print(re.findall(pattern, "I have a cat and a dog"))
# Output: ['cat', 'dog']
```

---

## Character Classes

### Predefined Character Classes

| Class | Description | Equivalent |
|-------|-------------|------------|
| `\d` | Digit | `[0-9]` |
| `\D` | Non-digit | `[^0-9]` |
| `\w` | Word character | `[a-zA-Z0-9_]` |
| `\W` | Non-word character | `[^a-zA-Z0-9_]` |
| `\s` | Whitespace | `[ \t\n\r\f\v]` |
| `\S` | Non-whitespace | `[^ \t\n\r\f\v]` |

### Custom Character Sets

```python
# [abc] - Match a, b, or c
pattern = r'[aeiou]'
print(re.findall(pattern, "hello world"))
# Output: ['e', 'o', 'o']

# [^abc] - Match anything except a, b, c
pattern = r'[^aeiou]'
print(re.findall(pattern, "hello"))
# Output: ['h', 'l', 'l']

# [a-z] - Range
pattern = r'[a-z]+'
print(re.findall(pattern, "Hello World 123"))
# Output: ['ello', 'orld']

# [A-Z] - Uppercase
pattern = r'[A-Z]'
print(re.findall(pattern, "Hello World"))
# Output: ['H', 'W']

# [0-9] - Digits
pattern = r'[0-9]+'
print(re.findall(pattern, "Room 123, Floor 4"))
# Output: ['123', '4']

# Combined ranges
pattern = r'[a-zA-Z0-9]+'
print(re.findall(pattern, "User123 logged in"))
# Output: ['User123', 'logged', 'in']
```

---

## Quantifiers

### Quantifier Types

| Quantifier | Matches | Example | Result |
|------------|---------|---------|--------|
| `*` | 0 or more | `ab*` | "a", "ab", "abb" |
| `+` | 1 or more | `ab+` | "ab", "abb" (not "a") |
| `?` | 0 or 1 | `ab?` | "a", "ab" |
| `{n}` | Exactly n | `a{3}` | "aaa" |
| `{n,}` | n or more | `a{2,}` | "aa", "aaa" |
| `{n,m}` | Between n and m | `a{2,4}` | "aa", "aaa", "aaaa" |

### Greedy vs Non-Greedy

```python
text = "<html><head></head><body></body></html>"

# Greedy (default) - matches as much as possible
pattern_greedy = r'<.*>'
print(re.findall(pattern_greedy, text))
# Output: ['<html><head></head><body></body></html>']
#         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (entire string)

# Non-greedy (add ?) - matches as little as possible
pattern_lazy = r'<.*?>'
print(re.findall(pattern_lazy, text))
# Output: ['<html>', '<head>', '</head>', '<body>', '</body>', '</html>']
#         ^^^^^^   ^^^^^^   ^^^^^^^   ^^^^^^   ^^^^^^^   ^^^^^^^

# Practical examples
text = "The price is $100 and $200"

# Greedy
print(re.findall(r'\$\d+', text))    # ['$100', '$200']

# With quantifiers
print(re.findall(r'\d{2,3}', "12 345 6789"))
# Output: ['12', '345', '678'] (greedy, takes 3 if possible)

print(re.findall(r'\d{2,3}?', "12 345 6789"))
# Output: ['12', '34', '67', '89'] (non-greedy, takes 2)
```

### Visual Representation

```
Text: "aaaa"

Pattern: a+     (greedy)
Match:   ^^^^   (all 4 a's)

Pattern: a+?    (non-greedy)
Match:   ^      (only 1 a)

Pattern: a{2,3}  (greedy)
Match:   ^^^     (3 a's) + ^  (remaining 1)

Pattern: a{2,3}? (non-greedy)
Match:   ^^      (2 a's) + ^^ (remaining 2)
```

---

## Groups and Capturing

### Basic Grouping

```python
# Grouping with ()
pattern = r'(ab)+'
print(re.findall(pattern, "ab abab ababab"))
# Output: ['ab', 'ab', 'ab']

# Multiple groups
pattern = r'(\w+)@(\w+)\.(\w+)'
email = "user@example.com"
match = re.search(pattern, email)
if match:
    print(f"Username: {match.group(1)}")  # user
    print(f"Domain: {match.group(2)}")    # example
    print(f"TLD: {match.group(3)}")       # com
    print(f"Full: {match.group(0)}")      # user@example.com

# Named groups
pattern = r'(?P<username>\w+)@(?P<domain>\w+)\.(?P<tld>\w+)'
match = re.search(pattern, email)
if match:
    print(match.group('username'))  # user
    print(match.group('domain'))    # example
    print(match.groupdict())
    # Output: {'username': 'user', 'domain': 'example', 'tld': 'com'}
```

### Non-Capturing Groups

```python
# Non-capturing group (?:...)
# Use when you need grouping but don't want to capture

# Capturing (default)
pattern = r'(https?)://(\w+)\.com'
print(re.findall(pattern, "http://google.com https://facebook.com"))
# Output: [('http', 'google'), ('https', 'facebook')]

# Non-capturing for protocol
pattern = r'(?:https?)://(\w+)\.com'
print(re.findall(pattern, "http://google.com https://facebook.com"))
# Output: ['google', 'facebook']  (only domain captured)
```

### Backreferences

```python
# \1, \2, ... refer to captured groups

# Find repeated words
pattern = r'\b(\w+)\s+\1\b'
text = "hello hello world world world"
print(re.findall(pattern, text))
# Output: ['hello', 'world']

# Find HTML tags
pattern = r'<(\w+)>.*?</\1>'
html = "<div>content</div> <span>text</span>"
print(re.findall(pattern, html))
# Output: ['div', 'span']

# Validate matching quotes
pattern = r'(["\']).*?\1'
text = '"hello" and \'world\''
print(re.findall(pattern, text))
# Output: ['"', "'"]
```

---

## Anchors and Boundaries

### Position Anchors

```python
# ^ - Start of string
pattern = r'^Python'
print(re.search(pattern, "Python is great"))   # Match
print(re.search(pattern, "I love Python"))     # No match

# $ - End of string
pattern = r'great$'
print(re.search(pattern, "Python is great"))   # Match
print(re.search(pattern, "great Python"))      # No match

# \b - Word boundary
pattern = r'\bcat\b'
print(re.findall(pattern, "cat cats scatter the cat"))
# Output: ['cat', 'cat']  (not from "cats" or "scatter")

# \B - Not word boundary
pattern = r'\Bcat\B'
print(re.findall(pattern, "cat cats scatter the cat"))
# Output: []  (cat in "scatter")

# Practical: Extract whole words
text = "The cats and cat are scattered"
pattern = r'\bcat\b'
print(re.findall(pattern, text))
# Output: ['cat']

# Validate entire string
def is_valid_username(username):
    # Must be 3-16 alphanumeric characters
    pattern = r'^[a-zA-Z0-9]{3,16}$'
    return bool(re.match(pattern, username))

print(is_valid_username("user123"))      # True
print(is_valid_username("ab"))           # False (too short)
print(is_valid_username("user@123"))     # False (special char)
```

### Visual Boundary Examples

```
Text: "cat cats scatter"

\bcat\b matches:
      ^^^          ← standalone "cat"
      ▲  ▲
   boundary  boundary

\bcat matches:
      ^^^  ^^^     ← "cat" and "cats"
      ▲    ▲
   boundary  boundary (start only)

cat\b matches:
      ^^^          ← only "cat" (not "scatter")
         ▲
      boundary (end only)
```

---

## Lookahead and Lookbehind

### Positive Lookahead `(?=...)`

Match if followed by pattern (without consuming)

```python
# Match digits followed by "px"
pattern = r'\d+(?=px)'
text = "width: 100px, height: 200px, depth: 50cm"
print(re.findall(pattern, text))
# Output: ['100', '200']  (not '50' as it's followed by 'cm')

# Password validation: must contain digit
pattern = r'^(?=.*\d).{8,}$'
print(bool(re.match(pattern, "password123")))  # True
print(bool(re.match(pattern, "password")))     # False (no digit)
```

### Negative Lookahead `(?!...)`

Match if NOT followed by pattern

```python
# Match numbers not followed by "px"
pattern = r'\d+(?!px)'
text = "width: 100px, height: 200px, depth: 50cm"
print(re.findall(pattern, text))
# Output: ['10', '20', '50']  (note: partial matches from 100, 200)

# Better: match whole number not followed by px
pattern = r'\b\d+\b(?!px)'
print(re.findall(pattern, text))
# Output: ['50']
```

### Positive Lookbehind `(?<=...)`

Match if preceded by pattern

```python
# Match digits preceded by "$"
pattern = r'(?<=\$)\d+'
text = "Price: $100, Discount: $20, Weight: 5kg"
print(re.findall(pattern, text))
# Output: ['100', '20']

# Extract domain from email
pattern = r'(?<=@)\w+\.\w+'
text = "Contact: user@example.com and admin@test.org"
print(re.findall(pattern, text))
# Output: ['example.com', 'test.org']
```

### Negative Lookbehind `(?<!...)`

Match if NOT preceded by pattern

```python
# Match digits not preceded by "$"
pattern = r'(?<!\$)\b\d+\b'
text = "Price: $100, Quantity: 5, Discount: $20"
print(re.findall(pattern, text))
# Output: ['5']
```

### Complex Password Validation

```python
def validate_password(password):
    """
    Password must:
    - Be 8-20 characters
    - Contain at least one uppercase
    - Contain at least one lowercase
    - Contain at least one digit
    - Contain at least one special character
    """
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$'
    return bool(re.match(pattern, password))

print(validate_password("Password123!"))   # True
print(validate_password("password123"))    # False (no uppercase or special)
print(validate_password("PASSWORD123!"))   # False (no lowercase)
print(validate_password("Pass123!"))       # False (too short)
```

---

## Common Patterns

### Email Validation

```python
# Simple email pattern
pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def is_valid_email(email):
    return bool(re.match(pattern, email))

print(is_valid_email("user@example.com"))     # True
print(is_valid_email("user.name@test.co.uk")) # True
print(is_valid_email("invalid.email"))        # False
print(is_valid_email("user@"))                # False

# Extract all emails from text
text = """
Contact us at support@company.com or sales@company.org.
For urgent matters: urgent@help.io
"""
pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
emails = re.findall(pattern, text)
print(emails)
# Output: ['support@company.com', 'sales@company.org', 'urgent@help.io']
```

### Phone Numbers

```python
# US phone numbers (various formats)
patterns = {
    'basic': r'\d{3}-\d{3}-\d{4}',              # 123-456-7890
    'parenthesis': r'\(\d{3}\)\s*\d{3}-\d{4}',  # (123) 456-7890
    'dots': r'\d{3}\.\d{3}\.\d{4}',             # 123.456.7890
    'spaces': r'\d{3}\s\d{3}\s\d{4}',           # 123 456 7890
}

# Universal pattern
universal_pattern = r'(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'

text = """
Call me at 123-456-7890 or (987) 654-3210
Alternative: 555.123.4567 or +1-800-555-0199
"""

phones = re.findall(universal_pattern, text)
print(phones)
# Output: ['123-456-7890', '(987) 654-3210', '555.123.4567', '+1-800-555-0199']

# Format phone numbers
def format_phone(phone):
    # Extract only digits
    digits = re.sub(r'\D', '', phone)
    # Format as (XXX) XXX-XXXX
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits[0] == '1':
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    return phone

print(format_phone("1234567890"))        # (123) 456-7890
print(format_phone("+1-800-555-0199"))   # +1 (800) 555-0199
```

### URLs

```python
# URL pattern
url_pattern = r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)'

text = """
Visit our website at https://www.example.com
Documentation: http://docs.example.com/guide
API: https://api.example.com/v1/users?id=123
"""

urls = re.findall(url_pattern, text)
print(urls)

# Extract URL components
url = "https://www.example.com:8080/path/to/page?key=value#section"
pattern = r'(?P<protocol>https?)://(?P<domain>[^:/]+)(?::(?P<port>\d+))?(?P<path>/[^?#]*)?(?:\?(?P<query>[^#]*))?(?:#(?P<fragment>.*))?'

match = re.match(pattern, url)
if match:
    print(match.groupdict())
    # Output: {
    #   'protocol': 'https',
    #   'domain': 'www.example.com',
    #   'port': '8080',
    #   'path': '/path/to/page',
    #   'query': 'key=value',
    #   'fragment': 'section'
    # }
```

### Date Formats

```python
# Various date formats
date_patterns = {
    'MM/DD/YYYY': r'\b(0?[1-9]|1[0-2])/(0?[1-9]|[12]\d|3[01])/(\d{4})\b',
    'DD-MM-YYYY': r'\b(0?[1-9]|[12]\d|3[01])-(0?[1-9]|1[0-2])-(\d{4})\b',
    'YYYY-MM-DD': r'\b(\d{4})-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])\b',
}

text = "Events: 12/25/2024, 2024-01-01, 31-12-2023"

for format_name, pattern in date_patterns.items():
    dates = re.findall(pattern, text)
    print(f"{format_name}: {dates}")

# Extract and convert dates
def extract_dates(text):
    # ISO format: YYYY-MM-DD
    pattern = r'\b(\d{4})-(\d{2})-(\d{2})\b'
    matches = re.findall(pattern, text)
    return [f"{year}-{month}-{day}" for year, month, day in matches]

text = "Release dates: 2024-01-15, 2024-03-20, 2024-12-25"
print(extract_dates(text))
# Output: ['2024-01-15', '2024-03-20', '2024-12-25']
```

### IP Addresses

```python
# IPv4 pattern
ipv4_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'

# More strict (validates 0-255 range)
ipv4_strict = r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b'

log = """
Connections from:
192.168.1.1 - Success
10.0.0.255 - Failed
256.1.1.1 - Invalid
172.16.254.1 - Success
"""

print("Simple pattern:", re.findall(ipv4_pattern, log))
# Output: ['192.168.1.1', '10.0.0.255', '256.1.1.1', '172.16.254.1']

print("Strict pattern:", re.findall(ipv4_strict, log))
# Output: ['192.168.1.1', '10.0.0.255', '172.16.254.1']  (excludes 256.1.1.1)
```

### Credit Card Numbers

```python
# Credit card pattern (with optional spaces/dashes)
cc_pattern = r'\b(?:\d{4}[-\s]?){3}\d{4}\b'

text = """
Card numbers:
4532-1234-5678-9010
5425 2334 3010 9903
378282246310005
Invalid: 1234
"""

cards = re.findall(cc_pattern, text)
print(cards)

# Mask credit card (show last 4 digits)
def mask_credit_card(text):
    pattern = r'\b(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})\b'
    return re.sub(pattern, r'****-****-****-\4', text)

text = "Card: 4532-1234-5678-9010"
print(mask_credit_card(text))
# Output: Card: ****-****-****-9010
```

---

## Python re Module

### Core Functions

```python
import re

text = "Python is great. Python is powerful."

# 1. re.match() - Match at beginning
match = re.match(r'Python', text)
print(match.group() if match else "No match")  # Python

# 2. re.search() - Find first occurrence anywhere
match = re.search(r'great', text)
print(match.group() if match else "No match")  # great

# 3. re.findall() - Find all occurrences
matches = re.findall(r'Python', text)
print(matches)  # ['Python', 'Python']

# 4. re.finditer() - Iterator of match objects
for match in re.finditer(r'Python', text):
    print(f"Found at {match.start()}-{match.end()}: {match.group()}")

# 5. re.sub() - Replace
new_text = re.sub(r'Python', 'Java', text)
print(new_text)  # Java is great. Java is powerful.

# 6. re.split() - Split string
parts = re.split(r'\s+', text)
print(parts)  # ['Python', 'is', 'great.', 'Python', 'is', 'powerful.']

# 7. re.compile() - Compile pattern for reuse
pattern = re.compile(r'\b\w+\b')
words = pattern.findall(text)
print(words)  # ['Python', 'is', 'great', 'Python', 'is', 'powerful']
```

### Flags

```python
# re.IGNORECASE (re.I) - Case insensitive
pattern = re.compile(r'python', re.IGNORECASE)
print(pattern.findall("Python PYTHON python"))
# Output: ['Python', 'PYTHON', 'python']

# re.MULTILINE (re.M) - ^ and $ match line boundaries
text = """line1: start
line2: start
line3: end"""

pattern = re.compile(r'^line\d+', re.MULTILINE)
print(pattern.findall(text))
# Output: ['line1', 'line2', 'line3']

# re.DOTALL (re.S) - . matches newline
text = "Hello\nWorld"
print(re.search(r'Hello.World', text))           # None
print(re.search(r'Hello.World', text, re.DOTALL)) # Match

# re.VERBOSE (re.X) - Allow comments and whitespace
pattern = re.compile(r'''
    \b              # Word boundary
    (\d{3})         # Area code
    [-.\s]?         # Optional separator
    (\d{3})         # Exchange
    [-.\s]?         # Optional separator
    (\d{4})         # Number
    \b              # Word boundary
''', re.VERBOSE)

# Combine flags
pattern = re.compile(r'python', re.IGNORECASE | re.MULTILINE)
```

### Match Objects

```python
text = "Email: user@example.com, Phone: 123-456-7890"
pattern = r'(\w+)@(\w+)\.(\w+)'

match = re.search(pattern, text)
if match:
    print(f"Full match: {match.group(0)}")      # user@example.com
    print(f"Group 1: {match.group(1)}")         # user
    print(f"Group 2: {match.group(2)}")         # example
    print(f"Group 3: {match.group(3)}")         # com
    print(f"All groups: {match.groups()}")      # ('user', 'example', 'com')
    print(f"Start: {match.start()}")            # 7
    print(f"End: {match.end()}")                # 23
    print(f"Span: {match.span()}")              # (7, 23)
```

---

## Practical Examples

### Example 1: Log File Parsing

```python
import re
from collections import Counter

# Sample log file
log_data = """
2024-01-15 10:23:45 INFO User login: user123 from 192.168.1.1
2024-01-15 10:24:12 ERROR Database connection failed: timeout
2024-01-15 10:25:33 INFO User login: user456 from 10.0.0.5
2024-01-15 10:26:01 WARNING High memory usage: 85%
2024-01-15 10:27:15 ERROR API request failed: 500 Internal Server Error
2024-01-15 10:28:45 INFO User logout: user123
"""

# Extract timestamps
timestamp_pattern = r'\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}'
timestamps = re.findall(timestamp_pattern, log_data)
print("Timestamps:", timestamps[:2])

# Extract log levels
level_pattern = r'(INFO|ERROR|WARNING|DEBUG)'
levels = re.findall(level_pattern, log_data)
print("\nLog level distribution:")
for level, count in Counter(levels).items():
    print(f"  {level}: {count}")

# Extract IP addresses
ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
ips = re.findall(ip_pattern, log_data)
print("\nIP addresses:", set(ips))

# Extract usernames
user_pattern = r'User \w+: (\w+)'
users = re.findall(user_pattern, log_data)
print("\nUsers:", users)

# Parse complete log entry
log_pattern = r'(?P<timestamp>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s(?P<level>\w+)\s(?P<message>.*)'

print("\nParsed log entries:")
for match in re.finditer(log_pattern, log_data):
    entry = match.groupdict()
    if entry['level'] == 'ERROR':
        print(f"[ERROR] {entry['timestamp']}: {entry['message']}")
```

### Example 2: Data Cleaning

```python
import pandas as pd
import re

# Sample messy data
data = {
    'phone': ['(123) 456-7890', '987.654.3210', '555-123-4567', '+1-800-555-0199'],
    'email': ['User@Example.COM', '  admin@test.org  ', 'SUPPORT@COMPANY.COM', 'info@help.io'],
    'price': ['$1,234.56', '$999.99', '$ 5,678.90', '$12.34'],
}

df = pd.DataFrame(data)
print("Original data:")
print(df)

# Clean phone numbers (extract digits only)
def clean_phone(phone):
    digits = re.sub(r'\D', '', phone)
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits[0] == '1':
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    return phone

df['phone_cleaned'] = df['phone'].apply(clean_phone)

# Clean emails (lowercase and strip)
df['email_cleaned'] = df['email'].str.strip().str.lower()

# Clean prices (remove $ and ,)
def clean_price(price):
    # Remove $, spaces, and commas
    cleaned = re.sub(r'[$,\s]', '', price)
    return float(cleaned)

df['price_cleaned'] = df['price'].apply(clean_price)

print("\nCleaned data:")
print(df[['phone_cleaned', 'email_cleaned', 'price_cleaned']])
```

### Example 3: Text Feature Extraction

```python
# Extract features from product descriptions
products = [
    "iPhone 14 Pro Max 256GB Space Gray - $1099.99",
    "Samsung Galaxy S23 Ultra 512GB Black - $1199.99",
    "Google Pixel 7 Pro 128GB Snow - $899.99",
]

# Extract model, storage, color, price
pattern = r'(?P<brand>\w+)\s+(?P<model>[\w\s]+?)\s+(?P<storage>\d+GB)\s+(?P<color>\w+)\s+-\s+\$(?P<price>[\d,]+\.\d{2})'

extracted_data = []
for product in products:
    match = re.search(pattern, product)
    if match:
        extracted_data.append(match.groupdict())

df = pd.DataFrame(extracted_data)
print(df)

# Output:
#      brand              model storage   color    price
# 0   iPhone   14 Pro Max       256GB   Space  1099.99
# 1  Samsung  Galaxy S23 Ultra  512GB   Black  1199.99
# 2   Google     Pixel 7 Pro    128GB    Snow   899.99
```

### Example 4: Web Scraping (Extract Links)

```python
html = """
<html>
<body>
    <a href="https://www.example.com">Example</a>
    <a href="http://test.org/page">Test Page</a>
    <a href="/relative/path">Relative</a>
    <img src="https://cdn.example.com/image.jpg">
</body>
</html>
"""

# Extract all URLs from href attributes
href_pattern = r'href=["\']([^"\']+)["\']'
hrefs = re.findall(href_pattern, html)
print("All hrefs:", hrefs)

# Extract only absolute URLs
abs_url_pattern = r'href=["\'](?:https?://[^"\']+)["\']'
abs_urls = re.findall(abs_url_pattern, html)
print("Absolute URLs:", abs_urls)

# Extract domain from URLs
domain_pattern = r'https?://([^/]+)'
domains = re.findall(domain_pattern, html)
print("Domains:", set(domains))
```

### Example 5: Password Strength Checker

```python
def check_password_strength(password):
    """
    Check password strength and return feedback
    """
    checks = {
        'length': len(password) >= 8,
        'uppercase': bool(re.search(r'[A-Z]', password)),
        'lowercase': bool(re.search(r'[a-z]', password)),
        'digit': bool(re.search(r'\d', password)),
        'special': bool(re.search(r'[@$!%*?&#]', password)),
    }

    score = sum(checks.values())

    feedback = []
    if not checks['length']:
        feedback.append("Password must be at least 8 characters")
    if not checks['uppercase']:
        feedback.append("Add at least one uppercase letter")
    if not checks['lowercase']:
        feedback.append("Add at least one lowercase letter")
    if not checks['digit']:
        feedback.append("Add at least one digit")
    if not checks['special']:
        feedback.append("Add at least one special character (@$!%*?&#)")

    strength = {
        0: "Very Weak",
        1: "Very Weak",
        2: "Weak",
        3: "Medium",
        4: "Strong",
        5: "Very Strong"
    }

    return {
        'score': score,
        'strength': strength[score],
        'feedback': feedback
    }

# Test passwords
passwords = ["pass", "Password", "Password1", "Password1!", "MyP@ssw0rd!"]

for pwd in passwords:
    result = check_password_strength(pwd)
    print(f"\nPassword: {pwd}")
    print(f"Strength: {result['strength']} ({result['score']}/5)")
    if result['feedback']:
        print("Suggestions:")
        for suggestion in result['feedback']:
            print(f"  - {suggestion}")
```

---

## Interview Questions

### Q1: What is the difference between `re.match()` and `re.search()`?

**Answer:**

| Function | Behavior | Use Case |
|----------|----------|----------|
| `re.match()` | Matches only at the **beginning** of the string | Validate entire string format |
| `re.search()` | Finds first match **anywhere** in the string | Find pattern anywhere |

**Example:**
```python
import re
text = "Hello Python World"

# re.match() - only matches at start
print(re.match(r'Python', text))   # None (Python not at start)
print(re.match(r'Hello', text))    # Match object

# re.search() - matches anywhere
print(re.search(r'Python', text))  # Match object
print(re.search(r'Hello', text))   # Match object
```

**When to use:**
- **`match()`**: Validating format (email, phone, etc.)
- **`search()`**: Finding substring (keyword in text)

---

### Q2: Explain greedy vs non-greedy matching.

**Answer:**

**Greedy (default):** Matches as much as possible
**Non-greedy (add `?`):** Matches as little as possible

**Example:**
```python
text = "<div>content</div><div>more</div>"

# Greedy: matches maximum
greedy = re.findall(r'<.*>', text)
print(greedy)
# Output: ['<div>content</div><div>more</div>']
#         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (entire string)

# Non-greedy: matches minimum
non_greedy = re.findall(r'<.*?>', text)
print(non_greedy)
# Output: ['<div>', '</div>', '<div>', '</div>']
```

**Visual:**
```
Text: "aaaa"
Pattern: a+   → Matches: "aaaa" (greedy)
Pattern: a+?  → Matches: "a" (non-greedy)
```

**Common use:** HTML/XML parsing, extracting quoted strings

---

### Q3: Write a regex to validate an email address.

**Answer:**

**Basic Pattern:**
```python
import re

# Simple email validation
pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def is_valid_email(email):
    return bool(re.match(pattern, email))

# Test cases
emails = [
    "user@example.com",          # Valid
    "user.name@test.co.uk",      # Valid
    "user+tag@example.com",      # Valid
    "invalid.email",             # Invalid (no @)
    "user@",                     # Invalid (no domain)
    "@example.com",              # Invalid (no local part)
    "user@example",              # Invalid (no TLD)
]

for email in emails:
    print(f"{email:25s} → {is_valid_email(email)}")
```

**Pattern Breakdown:**
```
^                       Start of string
[a-zA-Z0-9._%+-]+      Local part (letters, digits, special chars)
@                      At symbol
[a-zA-Z0-9.-]+         Domain name
\.                     Dot
[a-zA-Z]{2,}           TLD (at least 2 characters)
$                      End of string
```

**More Strict (RFC 5322 compliant):**
```python
# Comprehensive email validation
pattern = r'''^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$'''
```

---

### Q4: What are lookahead and lookbehind assertions?

**Answer:**

**Lookahead/Lookbehind:** Match position without consuming characters

| Type | Syntax | Description |
|------|--------|-------------|
| Positive Lookahead | `(?=...)` | Followed by pattern |
| Negative Lookahead | `(?!...)` | NOT followed by pattern |
| Positive Lookbehind | `(?<=...)` | Preceded by pattern |
| Negative Lookbehind | `(?<!...)` | NOT preceded by pattern |

**Examples:**

```python
# 1. Positive Lookahead - Match digits followed by "px"
pattern = r'\d+(?=px)'
text = "width: 100px, height: 200px, size: 50cm"
print(re.findall(pattern, text))
# Output: ['100', '200']  (not '50')

# 2. Negative Lookahead - Match words NOT followed by ":"
pattern = r'\b\w+\b(?!:)'
text = "name: John, age: 30, city"
print(re.findall(pattern, text))
# Output: ['John', '30', 'city']

# 3. Positive Lookbehind - Match digits preceded by "$"
pattern = r'(?<=\$)\d+'
text = "Price: $100, Quantity: 5"
print(re.findall(pattern, text))
# Output: ['100']

# 4. Negative Lookbehind - Match digits NOT preceded by "$"
pattern = r'(?<!\$)\b\d+\b'
print(re.findall(pattern, text))
# Output: ['5']
```

**Password Validation Example:**
```python
# Password must contain lowercase, uppercase, and digit
pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'

passwords = ["password", "Password", "Password1"]
for pwd in passwords:
    print(f"{pwd}: {bool(re.match(pattern, pwd))}")
# Output:
# password: False (no uppercase or digit)
# Password: False (no digit)
# Password1: True
```

---

### Q5: How would you extract all phone numbers from a text file?

**Answer:**

```python
import re

# Universal phone number pattern (US)
phone_pattern = r'''
    (?:\+1[-.\s]?)?        # Optional +1 country code
    \(?                    # Optional opening parenthesis
    (\d{3})                # Area code
    \)?                    # Optional closing parenthesis
    [-.\s]?                # Optional separator
    (\d{3})                # Exchange
    [-.\s]?                # Optional separator
    (\d{4})                # Number
'''

def extract_phone_numbers(filename):
    """Extract all phone numbers from file"""
    pattern = re.compile(phone_pattern, re.VERBOSE)

    phones = []
    with open(filename, 'r') as f:
        content = f.read()
        for match in pattern.finditer(content):
            # Format as (XXX) XXX-XXXX
            area, exchange, number = match.groups()
            formatted = f"({area}) {exchange}-{number}"
            phones.append(formatted)

    return phones

# Example usage
text = """
Contact Information:
Main office: (123) 456-7890
Support: 987-654-3210
Sales: 555.123.4567
International: +1-800-555-0199
"""

# Extract phones
pattern = re.compile(phone_pattern, re.VERBOSE)
phones = []
for match in pattern.finditer(text):
    area, exchange, number = match.groups()
    phones.append(f"({area}) {exchange}-{number}")

print("Phone numbers found:")
for phone in phones:
    print(f"  {phone}")

# Output:
# (123) 456-7890
# (987) 654-3210
# (555) 123-4567
# (800) 555-0199
```

---

### Q6: How do you use regex for data cleaning in pandas?

**Answer:**

```python
import pandas as pd
import re

# Sample messy data
df = pd.DataFrame({
    'email': ['User@Example.COM', '  admin@test.org  ', 'INVALID'],
    'phone': ['(123) 456-7890', '987.654.3210', '1234'],
    'price': ['$1,234.56', '$999.99', '$ 5,678.90'],
    'text': ['Hello123World', 'Test456Data', 'Sample789']
})

print("Original:")
print(df)

# 1. Clean emails (lowercase, strip whitespace)
df['email_clean'] = df['email'].str.strip().str.lower()

# 2. Validate emails
email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
df['is_valid_email'] = df['email_clean'].str.match(email_pattern)

# 3. Extract digits from phone
df['phone_digits'] = df['phone'].str.replace(r'\D', '', regex=True)

# 4. Clean prices (remove $, commas)
df['price_clean'] = df['price'].str.replace(r'[$,\s]', '', regex=True).astype(float)

# 5. Extract numbers from text
df['numbers'] = df['text'].str.extract(r'(\d+)')

# 6. Remove numbers from text
df['text_only'] = df['text'].str.replace(r'\d+', '', regex=True)

print("\nCleaned:")
print(df)

# Additional methods:
# str.contains() - Check if pattern exists
df['has_at'] = df['email'].str.contains(r'@')

# str.findall() - Find all matches
df['all_digits'] = df['text'].str.findall(r'\d')

# str.split() - Split by pattern
df['words'] = df['text'].str.split(r'\d+')
```

**Output:**
```
Original:
              email           phone       price           text
0  User@Example.COM  (123) 456-7890  $1,234.56  Hello123World
1    admin@test.org  987.654.3210    $999.99   Test456Data
2           INVALID        1234      $ 5,678.90  Sample789

Cleaned:
     email_clean  is_valid_email phone_digits  price_clean numbers text_only
0  user@example.com    True       1234567890    1234.56      123   HelloWorld
1  admin@test.org      True       9876543210     999.99      456   TestData
2  invalid             False      1234          5678.90      789   Sample
```

---

## Key Takeaways

1. **Basic Concepts:**
   - Metacharacters: `.` `^` `$` `*` `+` `?` `|` `[]` `()`
   - Character classes: `\d` `\w` `\s` and their negations
   - Quantifiers: `*` `+` `?` `{n,m}`

2. **Advanced Features:**
   - Groups: `()` for capturing, `(?:)` for non-capturing
   - Lookahead: `(?=...)` and `(?!...)`
   - Lookbehind: `(?<=...)` and `(?<!...)`

3. **Common Patterns:**
   - Email: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
   - Phone: `\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`
   - URL: `https?://[^\s]+`
   - IP: `(?:\d{1,3}\.){3}\d{1,3}`

4. **Python re Module:**
   - `match()` - Beginning only
   - `search()` - First occurrence
   - `findall()` - All matches
   - `sub()` - Replace
   - `split()` - Split string

5. **Best Practices:**
   - Use raw strings: `r'...'`
   - Compile patterns for reuse: `re.compile()`
   - Use named groups: `(?P<name>...)`
   - Test patterns thoroughly
   - Use verbose mode for complex patterns

6. **Real-World Applications:**
   - Data validation
   - Log file parsing
   - Data cleaning (pandas)
   - Web scraping
   - Text feature extraction

---

**Navigation:** [← Imbalanced Data](./imbalanced-data.md) | [Back to Index](./README.md) | [Next: NoSQL/MongoDB →](./nosql-mongodb.md)
