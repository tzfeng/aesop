interface NutInterface {
	name: string;
	type: string;
	legume: boolean;
	showMyNuts()
	isItLegume()
}

class Nuts implements NutInterface {
	name: string;
	type: string;
	legume: boolean;

	constructor(name: string, type: string, legume: boolean){
		this.name = name;
		this.type = type;
		this.legume = legume;
	}

	showMyNuts(){
		console.log(this.name);
	}

	isItLegume(){
		console.log(this.legume);
	}
}

let myNut = new Nuts('cashew', 'delicious', true);

myNut.showMyNuts();
myNut.isItLegume();