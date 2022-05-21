class Wonder {
  savage: string
  banana: string
  math: number
  constructor(savage: string, banana:string,math: number) {
    this.savage = savage
    this.banana = banana
    this.math = math
  }
} 


console.log(new Wonder('21','a',1).savage)
console.log(new Wonder('a','africanBanana',1).banana)
