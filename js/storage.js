const Store={key:'gmp_v1',def:{alias:'Guardián',diff:'Explorador',score:0,coins:0,xp:0,worlds:[],badges:[],answered:{},ok:0,bad:0,opts:{big:0,hc:0,calm:0},started:0},
load(){try{return Object.assign({},this.def,JSON.parse(localStorage.getItem(this.key))||{})}catch(e){return{...this.def}}},
save(s){try{localStorage.setItem(this.key,JSON.stringify(s))}catch(e){}},
reset(){try{localStorage.removeItem(this.key)}catch(e){}}};
