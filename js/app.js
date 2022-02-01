let layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
        color: "white"
    }
}

function fileContent(f,callback){
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        callback(event.target.result);
    });
    reader.readAsText(f);
}


$('#upload').change((e)=>{
    let f = e.target.files[0];
    load(f);
})

function load(f){
    fileContent(f,(c)=>{
        let lines = c.split(/\r?\n/);
        let en = '';
        let vs = '';
        lines.forEach(l => {
            d = l.split(';');
            if(d.length != 5) return 0;

            if(d[0] != '') en = Number(d[0]);
            if(d[1] != '') vs = Number(d[1]);
            let v = Number(d[2]);
            let i = Number(d[3]);
            let p = Number(d[4]);
            if(electrodes[en-1] === undefined) electrodes[en-1] = new Electrode(en);
            electrodes[en-1].addPoint(p,vs,v,i);
        });
        generateSelect();
        console.log(electrodes);
    });
}

let electrodes = [];

function generateSelect(){
    let select = $('#electrodesSelect');
    select.html('<option selected>-</option>');
    for(let i = 0;i<electrodes.length;i++){
        select.append(`<option value="${i+1}">Electrode #${i+1}</option>`);
    }
}

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
        let data = [];
        for(let i = 0; i < this.passes.length; i++){
            data.push({
                name:`Pass #${i+1}`,
                x: this.getValues(i+1,'v'),
                y: this.getValues(i+1,'i'),
                type: 'scatter'
            });
        }
        Plotly.newPlot(canid,data,layout);
    }

    getValues(pass,item){
        return this.passes[pass-1].map(e => e[item]);
    }

}

function selectElectrode(){
    let e = $('#electrodesSelect').val();
    if(isNaN(e)) return 0;

    let npass = electrodes[e-1].passes.length;
    let pselect = $('#passesSelect');
    pselect.html('<option selected>-</option>');
    for(let i = 0; i < npass; i++){
        pselect.append(`<option value="${i+1}">${i+1}</option>`)
    }
    electrodes[e-1].plotly('plotly');
}

$('#electrodesSelect').change(selectElectrode);