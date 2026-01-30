## 📦 Usages

1. Basic Math (அடிப்படை கணக்கு)
----------------------------------------------------

# Variables define automatically (no keyword needed)
x = 100
y = 50

# Calculation
total = x + y

# Output using f-string
பதி(f"Total value is: {total}")

2. User Input (பயனர் உள்ளீடு)
---------------------------------------------------

name = உள்ளிடு("Ungal peyar enna? ")
age = உள்ளிடு("Ungal vayathu? ")

பதி(f"Vanakkam {name}, neengal {age} vayathu udayavar.")

3. If / Else Logic (நிபந்தனைகள்)
---------------------------------------------------

mark = 85

எனில் mark >= 90:
    பதி("Grade A - Super!")
ஆனால் mark >= 50:
    பதி("Grade B - Pass")
இல்லை:
    பதி("Grade F - Fail")

4. Loops (சுழற்சிகள்)

For Loop (சுற்று):
----------------------------------------------------
# Prints numbers 0 to 4
# 'range' is 'தொடர்வெளியீடு' (or you can use 'range')
சுற்று i இல் range(5):
    பதி(f"Counting: {i}")


While Loop (வரை):
------------------------------------------------

Python
battery = 10
வரை battery > 0:
    பதி(f"Battery at {battery}%")
    battery = battery - 1

பதி("Shutdown.")    

5. Using Python Libraries
-------------------------------------------------

இறக்குமதி math
இறக்குமதி random ஆக rn

# Math calculation
root = math.sqrt(100)
பதி(f"Square root of 100 is: {root}")

# Random number generation
luck = rn.randint(1, 10)
பதி(f"Your lucky number is {luck}")

6. Object Oriented Programming
---------------------------------------------------

# Define a Class
வகுப்பு Dog:
    செயல் __init__(சுயம், name):
        சுயம்.name = name
    
    செயல் bark(சுயம்):
        பதி(f"{சுயம்.name} says Bow Bow!")

# Create Object
my_dog = Dog("Jimmy")
my_dog.bark()
