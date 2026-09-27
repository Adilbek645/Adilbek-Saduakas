using System;

class Program
{
    static void Main()
    {
        Task1_Factorial();
        Task2_DigitCount();
        Task3_DigitSum();
        Task4_ReverseNumber();
        Task5_CheckPrime();
        Task6_PrimesUpToN();
        Task7_Gcd();
        Task8_ArrayAverage();
        Task9_SecondMaxInArray();
        Task10_ReverseArrayInPlace();
        Task11_VowelCount();
        Task12_PalindromeCheck();
        Task13_RockPaperScissors();
        Task14_GuessNumber();
        Task15_StudentSystem();
    }

    static void Task1_Factorial()
    {
        Console.Write("Введите N: ");
        if (int.TryParse(Console.ReadLine(), out int n) && n >= 0)
        {
            long result = 1;
            for (int i = 1; i <= n; i++)
            {
                result *= i;
            }
            Console.WriteLine($"Факториал: {result}");
        }
        else
        {
            Console.WriteLine("Некорректный ввод!");
        }
    }

    static void Task2_DigitCount()
    {
        Console.Write("Введите число: ");
        if (long.TryParse(Console.ReadLine(), out long number))
        {
            long temp = Math.Abs(number);
            int count = 0;

            if (temp == 0)
            {
                count = 1;
            }
            else
            {
                while (temp > 0)
                {
                    count++;
                    temp /= 10;
                }
            }
            Console.WriteLine($"Количество цифр: {count}");
        }
    }

    static void Task3_DigitSum()
    {
        Console.Write("Введите число: ");
        if (long.TryParse(Console.ReadLine(), out long number))
        {
            long temp = Math.Abs(number);
            long sum = 0;

            while (temp > 0)
            {
                sum += temp % 10;
                temp /= 10;
            }
            Console.WriteLine($"Сумма цифр: {sum}");
        }
    }

    static void Task4_ReverseNumber()
    {
        Console.Write("Введите число: ");
        if (long.TryParse(Console.ReadLine(), out long number))
        {
            long temp = Math.Abs(number);
            long reversed = 0;

            while (temp > 0)
            {
                long digit = temp % 10;
                reversed = reversed * 10 + digit;
                temp /= 10;
            }

            if (number < 0) reversed = -reversed;

            Console.WriteLine($"Перевернутое число: {reversed}");
        }
    }

    static void Task5_CheckPrime()
    {
        Console.Write("Введите число: ");
        if (int.TryParse(Console.ReadLine(), out int n))
        {
            bool isPrime = n > 1;
            for (int i = 2; i * i <= n; i++)
            {
                if (n % i == 0)
                {
                    isPrime = false;
                    break;
                }
            }

            if (isPrime)
                Console.WriteLine("Число простое");
            else
                Console.WriteLine("Число не простое");
        }
    }

    static void Task6_PrimesUpToN()
    {
        Console.Write("Введите N: ");
        if (int.TryParse(Console.ReadLine(), out int n))
        {
            for (int i = 2; i <= n; i++)
            {
                bool isPrime = true;
                for (int j = 2; j * j <= i; j++)
                {
                    if (i % j == 0)
                    {
                        isPrime = false;
                        break;
                    }
                }
                if (isPrime)
                {
                    Console.Write(i + " ");
                }
            }
            Console.WriteLine();
        }
    }

    static void Task7_Gcd()
    {
        Console.Write("Первое число: ");
        int a = int.Parse(Console.ReadLine()!);
        Console.Write("Второе число: ");
        int b = int.Parse(Console.ReadLine()!);

        int origA = Math.Abs(a);
        int origB = Math.Abs(b);

        while (origB != 0)
        {
            int temp = origA % origB;
            origA = origB;
            origB = temp;
        }

        Console.WriteLine($"НОД: {origA}");
    }

    static void Task8_ArrayAverage()
    {
        int[] numbers = { 10, 20, 30, 40, 50 };

        double sum = 0;
        for (int i = 0; i < numbers.Length; i++)
        {
            sum += numbers[i];
        }

        double average = sum / numbers.Length;

        Console.WriteLine($"Массив: {string.Join(" ", numbers)}");
        Console.WriteLine($"Среднее: {average}");
    }

    static void Task9_SecondMaxInArray()
    {
        int[] numbers = { 15, 8, 27, 10, 21 };

        int max = int.MinValue;
        int secondMax = int.MinValue;

        foreach (int num in numbers)
        {
            if (num > max)
            {
                secondMax = max;
                max = num;
            }
            else if (num > secondMax && num < max)
            {
                secondMax = num;
            }
        }

        Console.WriteLine($"Массив: {string.Join(" ", numbers)}");
        if (secondMax != int.MinValue)
            Console.WriteLine($"Второе максимальное: {secondMax}");
        else
            Console.WriteLine("Второго максимального числа нет");
    }

    static void Task10_ReverseArrayInPlace()
    {
        int[] array = { 1, 2, 3, 4, 5 };

        Console.WriteLine($"Было: {string.Join(" ", array)}");

        for (int i = 0; i < array.Length / 2; i++)
        {
            int temp = array[i];
            array[i] = array[array.Length - 1 - i];
            array[array.Length - 1 - i] = temp;
        }

        Console.WriteLine($"Стало: {string.Join(" ", array)}");
    }

    static void Task11_VowelCount()
    {
        Console.Write("Введите строку: ");
        string text = Console.ReadLine() ?? "";

        string vowels = "аеёиоуыэюя";
        int count = 0;

        string lowerText = text.ToLower();
        foreach (char ch in lowerText)
        {
            if (vowels.Contains(ch))
            {
                count++;
            }
        }

        Console.WriteLine($"Количество гласных: {count}");
    }

    static void Task12_PalindromeCheck()
    {
        Console.Write("Введите слово: ");
        string text = Console.ReadLine() ?? "";

        string lowerText = text.ToLower();
        bool isPalindrome = true;

        for (int i = 0; i < lowerText.Length / 2; i++)
        {
            if (lowerText[i] != lowerText[lowerText.Length - 1 - i])
            {
                isPalindrome = false;
                break;
            }
        }

        if (isPalindrome)
            Console.WriteLine("Палиндром");
        else
            Console.WriteLine("Не палиндром");
    }

    static void Task13_RockPaperScissors()
    {
        string[] choices = { "Камень", "Ножницы", "Бумага" };
        Random random = new Random();

        Console.Write("Ваш выбор (Камень/Ножницы/Бумага): ");
        string userChoice = Console.ReadLine() ?? "";

        int compIndex = random.Next(3);
        string compChoice = choices[compIndex];

        Console.WriteLine($"Компьютер: {compChoice}");

        string user = userChoice.Trim().ToLower();
        string comp = compChoice.ToLower();

        if (user == comp)
        {
            Console.WriteLine("Ничья!");
        }
        else if ((user == "камень" && comp == "ножницы") ||
                 (user == "ножницы" && comp == "бумага") ||
                 (user == "бумага" && comp == "камень"))
        {
            Console.WriteLine("Вы победили!");
        }
        else
        {
            Console.WriteLine("Вы проиграли!");
        }
    }

    static void Task14_GuessNumber()
    {
        Random random = new Random();
        int targetNumber = random.Next(1, 101);
        int maxAttempts = 7;
        bool guessed = false;

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            Console.Write($"Попытка {attempt}/{maxAttempts}: ");
            if (int.TryParse(Console.ReadLine(), out int userGuess))
            {
                if (userGuess == targetNumber)
                {
                    Console.WriteLine($"Вы угадали за {attempt} попыток!");
                    guessed = true;
                    break;
                }
                else if (userGuess < targetNumber)
                {
                    Console.WriteLine("Загаданное число больше.");
                }
                else
                {
                    Console.WriteLine("Загаданное число меньше.");
                }
            }
            else
            {
                Console.WriteLine("Пожалуйста, введите число.");
            }
        }

        if (!guessed)
        {
            Console.WriteLine($"Попытки закончились. Загаданное число было: {targetNumber}");
        }
    }

    static void Task15_StudentSystem()
    {
        Console.Write("Введите количество студентов: ");
        if (!int.TryParse(Console.ReadLine(), out int count) || count <= 0)
        {
            Console.WriteLine("Некорректное количество!");
            return;
        }

        string[] names = new string[count];
        double[] grades = new double[count];

        for (int i = 0; i < count; i++)
        {
            Console.Write($"Имя студента #{i + 1}: ");
            names[i] = Console.ReadLine()!;
            Console.Write($"Оценка студента #{i + 1}: ");
            grades[i] = double.Parse(Console.ReadLine()!);
        }

        Console.WriteLine("\n--- Результаты ---");
        double sum = 0;
        double maxGrade = grades[0];
        string bestStudent = names[0];

        for (int i = 0; i < count; i++)
        {
            Console.WriteLine($"{names[i]} — {grades[i]}");
            sum += grades[i];

            if (grades[i] > maxGrade)
            {
                maxGrade = grades[i];
                bestStudent = names[i];
            }
        }

        double average = sum / count;
        int aboveAverageCount = 0;

        for (int i = 0; i < count; i++)
        {
            if (grades[i] > average)
            {
                aboveAverageCount++;
            }
        }

        Console.WriteLine($"Средняя оценка: {average:F1}");
        Console.WriteLine($"Лучший студент: {bestStudent} — {maxGrade}");
        Console.WriteLine($"Выше среднего: {aboveAverageCount}");
    }
}
