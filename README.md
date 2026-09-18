# B4DGERS Calculator

[![Status](https://img.shields.io/badge/Status-Completed-brightgreen)]()
[![Built With](https://img.shields.io/badge/Built%20With-HTML%20%7C%20CSS%20%7C%20JavaScript-blue)]()

> A dual-purpose calculator website combining a **Scientific Calculator** and a **GWA (General Weighted Average) Calculator** into one simple and convenient web application.

![Calculator Preview](images/calculator.png)

## ✨ Features

### 🧮 Scientific Calculator

* ➕ **Basic Arithmetic** - Addition, subtraction, multiplication, and division
* 🔢 **Advanced Calculations** - Powers, square roots, reciprocals, percentages, and factorials
* 📐 **Trigonometry** - sin, cos, tan, and their inverse functions
* 📊 **Logarithmic Functions** - log and ln
* 🧮 **Mathematical Constants** - π and e
* 🔄 **DEG/RAD Mode** - Switch between degree and radian calculations
* 💾 **Memory Functions** - MC, MR, M+, and M−
* 📝 **Ans Function** - Reuse the previous calculation result
* 📜 **Calculation History** - View, reuse, and remove previous calculations
* ⌨️ **Keyboard Support** - Perform calculations using supported keyboard inputs
* ⚠️ **Error Handling** - Displays feedback for invalid expressions and calculation errors

### 🎓 GWA Calculator

* 📚 **Subject Management** - Add and remove subjects
* 📝 **Grade Input** - Select grades from 1.00 to 3.00, including 5.00
* ⚖️ **Weighted Calculation** - Calculates GWA based on subject units
* 📊 **GWA Summary** - Displays GWA, total subjects, units, and weighted grade
* 🏆 **Academic Status** - Displays the corresponding status based on the calculated GWA
* 📋 **Input Validation** - Checks for missing subjects, invalid units, and invalid grades
* 📋 **Copy GWA** - Click the calculated GWA to copy it to the clipboard
* 💾 **Saved Subjects** - Subject entries are preserved using Local Storage

### 🌓 Theme & Interface

* 🌞 **Light Mode** - Clean light interface
* 🌙 **Dark Mode** - Dark theme for comfortable viewing
* 💾 **Saved Preferences** - Theme selection is remembered
* 🔄 **Panel Switching** - Switch between Scientific Calculator and GWA Calculator
* 📱 **Responsive Design** - Adapts to different screen sizes
* 🔔 **Toast Notifications** - Provides feedback for user actions

## 🛠️ Built With

* **HTML5** - Structure and content
* **CSS3** - Custom styling, responsive layouts, themes, and calculator interface
* **JavaScript** - Calculator logic, GWA calculations, interactions, validation, and Local Storage
* **Local Storage API** - Saves calculator preferences, history, memory, GWA entries, and previous results
* **Clipboard API** - Allows users to copy their calculated GWA

## 🧠 Calculator Logic

The Scientific Calculator uses a custom expression parser that handles:

* Tokenization
* Operator precedence
* Unary operators
* Parentheses
* Reverse Polish Notation (RPN)
* Mathematical functions
* DEG/RAD trigonometric calculations
* Factorial validation
* Calculation error handling

The GWA Calculator uses the formula:

```text
GWA = Σ(Grade × Units) / Σ(Units)
```

The calculator also provides academic status classifications based on the calculated GWA.

## 📁 Project Structure

```text
B4DGERS-Calculator/
│
├── index.html        # Main calculator interface
├── style.css         # Main stylesheet, themes, and responsive design
├── script.js         # Calculator logic and interactive functionality
│
└── README.md         # Project documentation
```

## 🚀 How to Run

1. Clone or download the repository.
2. Open `index.html` in your web browser.
3. Choose between the **Scientific Calculator** or **GWA Calculator**.
4. Start calculating.

No server or additional installation is required.

## 💡 About the Project

This project originally started as **two separate calculator projects**: a Scientific Calculator and a GWA Calculator.

Instead of keeping them as separate websites, I decided to combine them into one application. This makes the project more practical, especially for students who may need both mathematical calculations and GWA calculations in one place.

The project also gave me an opportunity to practice JavaScript logic, user interface design, validation, Local Storage, and building a more complete web application from scratch.

## 🔮 Future Improvements

* [ ] Add more scientific and mathematical functions
* [ ] Add additional calculator modes
* [ ] Improve GWA customization
* [ ] Support additional grading systems
* [ ] Improve mobile interface
* [ ] Add more student-focused tools
* [ ] Add more personalization options

## 👨‍💻 Author

**B4DGER**

UI/UX Designer • Full-Stack Developer • App Developer

---

⭐ If you find this project useful, feel free to star the repository!
