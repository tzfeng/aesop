interface DeezNuts {
	deez: string;
	nuts: string;
}

let myNuts = {deez: 'my', nuts: 'cashews'};

function showMyNuts(goteem: DeezNuts){
	console.log(goteem.deez + ' ' + goteem.nuts);
}

showMyNuts(myNuts);