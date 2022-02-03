class Electrode{
    constructor(n){
        this.n = n;
        this.passes = [];
    }

    addPoint(pass,vs,v,i){
        if(this.passes[pass-1] === undefined) this.passes[pass-1] = [];
        this.passes[pass-1].push({vs:vs,v:v,i:i});
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
                x: this.getValues(i+1,'v'),
                y: this.getValues(i+1,'i'),
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