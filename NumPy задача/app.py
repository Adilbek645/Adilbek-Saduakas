# Задание 1
import numpy as np


# Задание 2
values = np.array([5, 10, 15, 20, 25])
print("Массив values:", values)


# Задание 3
zeros = np.zeros(5)
ones = np.ones(4)
even_numbers = np.arange(2, 13, 2)
print("а) Пять нулей:", zeros)
print("б) Четыре единицы:", ones)
print("в) Чётные числа от 2 до 12:", even_numbers)


# Задание 4
a = np.array([[3, 6, 9],
              [12, 15, 18]])
print("ndim:", a.ndim)
print("shape:", a.shape)
print("size:", a.size)
print("dtype:", a.dtype)


# Задание 5
numbers = np.array([10, 20, 30, 40, 50])
print("Первый элемент:", numbers[0])
print("Третий элемент:", numbers[2])
print("Последний элемент:", numbers[-1])
numbers[2] = 100
print("После замены 30 на 100:", numbers)


# Задание 6
print("а) Элементы с индексами от 1 до 3 включительно:", numbers[1:4])
print("б) Первые три элемента:", numbers[:3])
print("в) Элементы начиная с индекса 2:", numbers[2:])


# Задание 7
grades = np.array([[85, 90, 78],
                   [70, 88, 92],
                   [95, 81, 89]])
print("Оценка 88:", grades[1, 1])
print("Вторая строка:", grades[1, :])
print("Третий столбец:", grades[:, 2])
