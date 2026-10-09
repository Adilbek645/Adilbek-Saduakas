using System;

namespace ЗадачиКонструкторов;

public class Человек
{
    public string Имя;
    public int Возраст;
    public Человек() { Имя = "Не указано"; Возраст = 0; }
    public Человек(string имя, int возраст) { Имя = имя; Возраст = возраст; }
}

public class Автомобиль
{
    public string Марка; public int ГодВыпуска;
    public Автомобиль(string марка, int годВыпуска) { Марка = марка; ГодВыпуска = годВыпуска; }
    public Автомобиль(string марка) : this(марка, 0) { }
}

public class Студент
{
    public string ФИО; public int Курс; public string Группа;
    public Студент(string фио) : this(фио, 1, "Не указана") { }
    public Студент(string фио, int курс) : this(фио, курс, "Не указана") { }
    public Студент(string фио, int курс, string группа) { ФИО = фио; Курс = курс; Группа = группа; }
    public void Показать() => Console.WriteLine($"{ФИО}, курс {Курс}, группа {Группа}");
}

public class Книга
{
    public string Название; public string Автор; public int Год;
    public Книга(string название) : this(название, "Не указан", 0) { }
    public Книга(string название, string автор) : this(название, автор, 0) { }
    public Книга(string название, string автор, int год) { Название = название; Автор = автор; Год = год; }
    public Книга(Книга другая) : this(другая.Название, другая.Автор, другая.Год) { }
}

public class Телефон { public string Модель; public decimal Цена; public Телефон(string модель, decimal цена) { Модель = модель; Цена = цена; } }
public class Товар
{
    public string Название; public int Количество; public decimal Цена;
    public Товар(string название, int количество) { Название = название; Количество = количество; }
    public Товар(string название) : this(название, 0) { }
    public Товар(string название, decimal цена) : this(название, 0) { Цена = цена; }
}
public class Сотрудник
{
    public string Имя; public string Должность; public decimal Зарплата;
    public Сотрудник(string имя) : this(имя, "Не указана", 0) { }
    public Сотрудник(string имя, string должность) : this(имя, должность, 0) { }
    public Сотрудник(string имя, string должность, decimal зарплата) { Имя = имя; Должность = должность; Зарплата = зарплата; }
    public void Показать() => Console.WriteLine($"{Имя}, {Должность}, {Зарплата}");
}
public class Компьютер
{
    public string Модель; public string Процессор; public int ОЗУ;
    public Компьютер(string процессор, int озу) : this("Не указана", процессор, озу) { }
    public Компьютер(string модель) : this(модель, "Не указан", 0) { }
    public Компьютер(string модель, string процессор, int озу) { Модель = модель; Процессор = процессор; ОЗУ = озу; }
}
public class Кошка
{
    public string Кличка; public int Возраст;
    public Кошка(string кличка, int возраст) { Кличка = кличка; Возраст = возраст; }
    public void Показать() => Console.WriteLine($"Кошка {Кличка}, {Возраст} лет");
}
public class Банк { public string Название; public Банк(string название) => Название = название; }
public class Прямоугольник
{
    public double Длина; public double Ширина;
    public Прямоугольник(double длина, double ширина) { Длина = длина; Ширина = ширина; }
    public double Площадь() => Длина * Ширина;
}
public class Круг
{
    public double Радиус;
    public Круг(double радиус) { if (радиус < 0) throw new ArgumentOutOfRangeException(nameof(радиус)); Радиус = радиус; }
    public double Площадь() => Math.PI * Радиус * Радиус;
}
public class Калькулятор
{
    private readonly double a, b;
    public Калькулятор(double первое, double второе) { a = первое; b = второе; }
    public double Сложить() => a + b;
    public double Вычесть() => a - b;
    public double Умножить() => a * b;
    public double Разделить() => b == 0 ? throw new DivideByZeroException() : a / b;
}
public class Счёт
{
    public string Номер; public decimal Баланс;
    public Счёт(string номер, decimal начальныйБаланс) { if (начальныйБаланс < 0) throw new ArgumentOutOfRangeException(nameof(начальныйБаланс)); Номер = номер; Баланс = начальныйБаланс; }
    public void Пополнить(decimal сумма) { if (сумма <= 0) throw new ArgumentOutOfRangeException(nameof(сумма)); Баланс += сумма; }
}
public class Самолёт { public string Модель; public int Пассажиры; public double МаксСкорость; public Самолёт(string модель, int пассажиры, double скорость) { Модель = модель; Пассажиры = пассажиры; МаксСкорость = скорость; } }
public class Игрок
{
    public string Имя; public int Очки;
    public Игрок(string имя) : this(имя, 0) { }
    public Игрок(string имя, int очки) { Имя = имя; Очки = очки; }
    public void ДобавитьОчки(int значение) { if (значение < 0) throw new ArgumentOutOfRangeException(nameof(значение)); Очки += значение; }
}
public class Фильм { public string Название; public string Жанр; public int Минуты; public Фильм(string название, string жанр, int минуты) { Название = название; Жанр = жанр; Минуты = минуты; } }
public class Ноутбук { public string Производитель; public string Модель; public decimal Стоимость; public Ноутбук(string производитель, string модель, decimal стоимость) { Производитель = производитель; Модель = модель; Стоимость = стоимость; } }
public class Университет { public string Название; public int Студенты; public Университет(string название, int студенты) { Название = название; Студенты = студенты; } }
public class Заказ
{
    public int Номер; public string Товар; public decimal Стоимость;
    public Заказ(int номер) : this(номер, "Не указан", 0) { }
    public Заказ(int номер, string товар) : this(номер, товар, 0) { }
    public Заказ(int номер, string товар, decimal стоимость) { Номер = номер; Товар = товар; Стоимость = стоимость; }
}
public class Квартира
{
    public string Адрес; public double Площадь; public int Комнаты;
    public Квартира(string адрес) : this(адрес, 0, 0) { }
    public Квартира(string адрес, double площадь, int комнаты) { Адрес = адрес; Площадь = площадь; Комнаты = комнаты; }
}

public class Person
{
    public string Name; public int Age;
    public Person() : this("Без имени", 0) { }
    public Person(string name, int age) { Name = name; Age = age; }
}
public class BankAccount
{
    public decimal Balance;
    public BankAccount(decimal initialBalance) { if (initialBalance < 0) throw new ArgumentOutOfRangeException(nameof(initialBalance), "Баланс не может быть отрицательным."); Balance = initialBalance; }
}
public class StudentId
{
    private static int nextId;
    public int Id { get; } = ++nextId;
    public string Name { get; }
    public StudentId(string name) => Name = name;
}
public class Product
{
    public decimal Price { get; } public int Quantity { get; } public decimal Total { get; }
    public Product(decimal price, int quantity) { if (price < 0 || quantity < 0) throw new ArgumentOutOfRangeException(); Price = price; Quantity = quantity; Total = price * quantity; }
}
public class Дата
{
    public DateOnly Значение { get; }
    public Дата(int день, int месяц, int год) { Значение = new DateOnly(год, месяц, день); }
}
public class Треугольник
{
    public double A, B, C;
    public Треугольник(double a, double b, double c) { if (a <= 0 || b <= 0 || c <= 0 || a + b <= c || a + c <= b || b + c <= a) throw new ArgumentException("Треугольник с такими сторонами не существует."); A = a; B = b; C = c; }
}
public class Car
{
    public static int Количество { get; private set; }
    public string Модель { get; }
    public Car(string модель) { Модель = модель; Количество++; }
}
public class Animal
{
    public string Имя { get; }
    public Animal(string имя) => Имя = имя;
}
public class Dog : Animal
{
    public string Порода { get; }
    public Dog(string имя, string порода) : base(имя) => Порода = порода;
}
public class StudentRecord
{
    public string ФИО { get; } public int Курс { get; } public string Группа { get; } public double СреднийБалл { get; }
    public StudentRecord(string фио) : this(фио, 1, "Не указана", 0) { }
    public StudentRecord(string фио, int курс, string группа, double среднийБалл)
    {
        if (string.IsNullOrWhiteSpace(фио)) throw new ArgumentException("ФИО обязательно.", nameof(фио));
        if (курс < 1 || курс > 6) throw new ArgumentOutOfRangeException(nameof(курс));
        if (string.IsNullOrWhiteSpace(группа)) throw new ArgumentException("Группа обязательна.", nameof(группа));
        if (среднийБалл < 0 || среднийБалл > 100) throw new ArgumentOutOfRangeException(nameof(среднийБалл));
        ФИО = фио; Курс = курс; Группа = группа; СреднийБалл = среднийБалл;
    }
    public void Показать() => Console.WriteLine($"{ФИО}; курс {Курс}; группа {Группа}; средний балл {СреднийБалл}");
}

public static class Program
{
    public static void Main()
    {
        var человек = new Человек("Алия", 18);
        Console.WriteLine($"{человек.Имя}, {человек.Возраст}");
        Console.WriteLine($"Площадь прямоугольника: {new Прямоугольник(5, 3).Площадь()}");
        var калькулятор = new Калькулятор(12, 4);
        Console.WriteLine($"12 / 4 = {калькулятор.Разделить()}");
        new StudentRecord("Иван Иванов", 2, "ИС-21", 87.5).Показать();
    }
}
