var Nuts = /** @class */ (function () {
    function Nuts(name, type, legume) {
        this.name = name;
        this.type = type;
        this.legume = legume;
    }
    Nuts.prototype.showMyNuts = function () {
        console.log(this.name);
    };
    Nuts.prototype.isItLegume = function () {
        console.log(this.legume);
    };
    return Nuts;
}());
var myNut = new Nuts('cashew', 'delicious', true);
myNut.showMyNuts();
myNut.isItLegume();
