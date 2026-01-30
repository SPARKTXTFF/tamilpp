# 🚀 TamilPP (தமிழ் நிரலாக்க மொழி)

![Python](https://img.shields.io/badge/Python-3.x-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Active-success)

**TamilPP** is a robust programming language that allows you to write Python code entirely in **Tamil**.

It acts as a bridge, translating Tamil keywords into Python commands in real-time. This means you can use **Loops, Functions, Classes, Error Handling, and external PIP libraries** directly in Tamil!

---

## 📦 Installation (நிறுவுதல்)

You can install TamilPP globally using pip:

```bash
pip install tamilpp
```
# USAGES

# Variables & Math (அடிப்படை)
```Tamilpp
# Variables define automatically
x = 100
y = 50

# Calculation
total = x + y

# Output using f-string
பதி(f"The total is: {total}")
```
# User Input (பயனர் உள்ளீடு)
```Tamilpp
name = உள்ளிடு("Ungal peyar enna? ")
age = உள்ளிடு("Ungal vayathu? ")

பதி(f"Vanakkam {name}, neengal {age} vayathu udayavar.")
```
# Logic: If / Else (நிபந்தனைகள்)
```Tamilpp
mark = 85

எனில் mark >= 90:
    பதி("Grade A - Super!")
ஆனால் mark >= 50:
    பதி("Grade B - Pass")
இல்லை:
    பதி("Grade F - Fail")
```
# Loops (சுழற்சிகள்)
For Loop (சுற்று):
```Tamilpp
# Prints numbers 0 to 4
# 'range' works directly
சுற்று i இல் range(5):
    பதி(f"Count: {i}")
```
While Loop (வரை):
```Tamilpp
battery = 3
வரை battery > 0:
    பதி(f"Battery at {battery}%")
    battery = battery - 1

பதி("Shutdown.")
```
# Functions (செயல்கள்)
```Tamilpp
# 1. Define function
செயல் add_numbers(a, b):
    result = a + b
    திருப்பு result

# 2. Call function
ans = add_numbers(50, 50)
பதி(f"The answer is: {ans}")
```
# Using Libraries (நூலகங்கள்)
```Tamilpp
இறக்குமதி math
இறக்குமதி random ஆக rn

# Math calculation
root = math.sqrt(100)
பதி(f"Square root of 100 is: {root}")

# Random number generation
luck = rn.randint(1, 10)
பதி(f"Your lucky number is {luck}")
```
# Object Oriented Programming (வகுப்பு)
```Tamilpp
வகுப்பு Dog:
    செயல் __init__(சுயம், name):
        சுயம்.name = name
    
    செயல் bark(சுயம்):
        பதி(f"{சுயம்.name} says Bow Bow!")

# Create Object
my_dog = Dog("Jimmy")
my_dog.bark()
```
# Error Handling (பிழை கையாளுதல்)
```Tamilpp
முயற்சி:
    x = 10 / 0  # This creates an error
    பதி(x)
பிழை Exception ஆக e:
    பதி(f"Error Caught: {e}")
```

# Made By 
[Youtube -> @sparktxt](https://www.youtube.com/@Sparktxt)
[Instagram -> @agent--spark](https://www.instagram.com/agent__spark/)
