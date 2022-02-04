class Electrode{
    constructor(n){
        this.n = n;
        this.passes = [];
    }

    addPointCV(pass,vs,v,i){
        if(this.passes[pass-1] === undefined) this.passes[pass-1] = [];
        this.xitem = 'v';
        this.yitem = 'i';
        this.passes[pass-1].push({vs:vs,v:v,i:i});
    }

    addPointEIS(f,m,a){
        let pass = 1;
        if(this.passes[pass-1] === undefined) this.passes[pass-1] = [];
        this.xitem = 'f';
        this.yitem = 'm';
        this.passes[pass-1].push({f:f,m:m,a:a});
    }

    plotly(canid){
        let data = this.plotdata();
        Plotly.newPlot(canid,data,layout);
    }
    
    plotdata(){
        let data = [];
        for(let i = 0; i < this.passes.length; i++){
            data.push({
                name:`E${this.n} Pass #${i+1}`,
                x: this.getValues(i+1,this.xitem),
                y: this.getValues(i+1,this.yitem),
                type: 'scatter'
            });
        }    
        return data;
    }

    getValues(pass,item){
        return this.passes[pass-1].map(e => e[item]);
    }

}

export {Electrode}