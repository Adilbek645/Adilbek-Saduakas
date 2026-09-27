using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        int[] nums1 = { 2, 7, 4, 9, 10, 3, 8, 5, 6, 1 };
        var evens = nums1.Where(x => x % 2 == 0).ToArray();
        var odds = nums1.Where(x => x % 2 != 0).ToArray();
        Console.WriteLine($"Чётные: {string.Join(" ", evens)} | Нечётные: {string.Join(" ", odds)}");

        int[] nums2 = { 10, 5, 8, 20, 15, 20, 3 };
        int max = int.MinValue, secondMax = int.MinValue;
        foreach (int n in nums2)
        {
            if (n > max) { secondMax = max; max = n; }
            else if (n > secondMax && n < max) { secondMax = n; }
        }
        Console.WriteLine($"Второй максимум: {secondMax}");

        int[] nums3 = { 1, 2, 2, 3, 4, 4, 5 };
        int[] unique = nums3.Distinct().ToArray();
        Console.WriteLine($"Без дубликатов: [{string.Join(", ", unique)}]");

        int[] arr4 = { 1, 2, 3, 4, 5 };
        for (int i = 0; i < arr4.Length / 2; i++)
        {
            int t = arr4[i];
            arr4[i] = arr4[arr4.Length - 1 - i];
            arr4[arr4.Length - 1 - i] = t;
        }
        Console.WriteLine($"Перевернутый: [{string.Join(", ", arr4)}]");

        string str5 = "CSharp 2026!";
        int l = 0, d = 0, s = 0, o = 0;
        foreach (char c in str5)
        {
            if (char.IsLetter(c)) l++;
            else if (char.IsDigit(c)) d++;
            else if (char.IsWhiteSpace(c)) s++;
            else o++;
        }
        Console.WriteLine($"Букв: {l}, Цифр: {d}, Пробелов: {s}, Других: {o}");

        string sent6 = "Я изучаю программирование на CSharp";
        string longest = sent6.Split(' ').OrderByDescending(w => w.Length).First();
        Console.WriteLine($"Самое длинное слово: {longest}");

        string word7 = "шалаш";
        bool isPal = word7.ToLower().SequenceEqual(word7.ToLower().Reverse());
        Console.WriteLine($"{word7} палиндром? {isPal}");

        int n8 = 20;
        for (int i = 2; i <= n8; i++)
        {
            bool prime = true;
            for (int j = 2; j <= Math.Sqrt(i); j++) if (i % j == 0) prime = false;
            if (prime) Console.Write(i + " ");
        }
        Console.WriteLine();

        int target = 42;
        int guess = 42;
        Console.WriteLine($"Угадано число {target}, попыток: 1");

        decimal balance = 100000;
        decimal withdraw = 20000;
        if (withdraw <= balance) balance -= withdraw;
        Console.WriteLine($"Баланс после снятия: {balance}");

        double Add(double a, double b) => a + b;
        Console.WriteLine($"Калькулятор (5 + 3): {Add(5, 3)}");

        int[] grades = { 5, 4, 3, 5, 2, 4, 5, 3, 4, 5 };
        Console.WriteLine($"Средний балл: {grades.Average():F1}, Пятёрок: {grades.Count(x => x == 5)}");

        string text13 = "кот собака кот кот собака";
        var freq = text13.Split(' ').GroupBy(w => w).ToDictionary(g => g.Key, g => g.Count());
        foreach (var pair in freq) Console.WriteLine($"{pair.Key}: {pair.Value}");

        Dictionary<string, string> phoneBook = new Dictionary<string, string> { { "Иван", "12345" } };
        Console.WriteLine($"Телефон Ивана: {phoneBook["Иван"]}");

        var students = new List<Student> {
            new Student { Name = "Али", Age = 17, Grade = 4.5 },
            new Student { Name = "Диас", Age = 19, Grade = 4.8 }
        };
        Console.WriteLine($"Лучший студент: {students.OrderByDescending(s => s.Grade).First().Name}");

        var acc = new BankAccount("Иван", 50000);
        acc.Deposit(10000);
        acc.Withdraw(15000);

        var prod = new Product { Name = "Ноутбук", Price = 350000, Quantity = 2 };
        Console.WriteLine($"Товар: {prod.Name}, Всего: {prod.GetTotalCost()}");

        int[] arr18 = { 8, 3, 1, 9, 5 };
        Array.Sort(arr18);
        Console.WriteLine($"Отсортировано: [{string.Join(", ", arr18)}]");

        string[] rps = { "Камень", "Ножницы", "Бумага" };
        Console.WriteLine($"Компьютер выбрал: {rps[0]}");

        Dictionary<string, string> users = new Dictionary<string, string> { { "student", "12345" } };
        bool auth = users.ContainsKey("student") && users["student"] == "12345";
        Console.WriteLine($"Авторизация успешна: {auth}");
    }

    class Student
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public double Grade { get; set; }
    }

    class BankAccount
    {
        public string Owner { get; set; }
        public decimal Balance { get; private set; }
        public BankAccount(string owner, decimal balance) { Owner = owner; Balance = balance; }
        public void Deposit(decimal amount) => Balance += amount;
        public void Withdraw(decimal amount) { if (amount <= Balance) Balance -= amount; }
    }

    class Product
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal GetTotalCost() => Price * Quantity;
    }
}