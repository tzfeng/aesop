function bigMath(num1: number, num2: number): number {
	return num1 * num2
}

let res: number;

res = bigMath(7, 9);

console.log(res);

let biggerMath = function(num1: any, num2: any) : number {
	if(typeof num1 == 'string'){
		num1 = parseInt(num1);
	}
	if(typeof num2 == 'string'){
		num2 = parseInt(num2);
	}
	return Math.pow(num1, num2);
}

console.log(biggerMath('2', '10'));