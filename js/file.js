import {Electrode} from './electrodes.js';

function fileContent(f){
    return new Promise( (resolve,reject)=>{
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            resolve(event.target.result);
        });
        reader.readAsText(f);
    })
}

function load(f){
    return new Promise( (resolve, reject) => {
        fileContent(f).then((c)=>{
            let electrodes = [];
            let lines = c.split(/\r?\n/);
            let en = '';
            let vs = '';
            lines.forEach(l => {
                let d = l.split(';');
                if(d.length != 5) return 0;
    
                if(d[0] != '') en = Number(d[0]);
                if(d[1] != '') vs = Number(d[1]);
                let v = Number(d[2]);
                let i = Number(d[3]);
                let p = Number(d[4]);
                if(electrodes[en-1] === undefined) electrodes[en-1] = new Electrode(en);
                electrodes[en-1].addPoint(p,vs,v,i);
            });
            resolve(electrodes);
        });
    });
}

export {load};