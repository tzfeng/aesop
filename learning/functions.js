function bigMath(num1, num2) {
    return num1 * num2;
}
var res;
res = bigMath(7, 9);
console.log(res);
var biggerMath = function (num1, num2) {
    if (typeof num1 == 'string') {
        num1 = parseInt(num1);
    }
    if (typeof num2 == 'string') {
        num2 = parseInt(num2);
    }
    return Math.pow(num1, num2);
};
console.log(biggerMath('2', '10'));
