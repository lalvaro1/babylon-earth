import { ShaderMaterial, Vector3 } from "@babylonjs/core";

export class FloatUniform {
    public value : number;
    public min : number;    
    public max : number;    
    public step : number;        
}

export class InteractiveFloatUniforms {

    private prefix = "PARAM_";
    public settings = {};

    constructor(_settings : object) {
        this.settings = _settings;
    }

    isFloatValue(value) {
        return typeof value === 'object';
    }

    colorStrToVec3(str) {
        const r = parseInt(str.slice(1,3), 16);
        const g = parseInt(str.slice(3,5), 16);
        const b = parseInt(str.slice(5,8), 16);
        
        return new Vector3(r/255., g/255., b/255.);
    }

    updateShader(material : ShaderMaterial) {
        const uniforms = Object.entries(this.settings);
        
        uniforms.forEach(([key, value]) => {

            if(this.isFloatValue(value)) {
                const uniform = value as FloatUniform;
                material.setFloat(this.prefix + key, uniform.value);          
            }
            else {
                material.setVector3(this.prefix + key, this.colorStrToVec3(value));                          
            }
        });
    }

    getUniformList() {
        return Object.keys(this.settings).map((key) => this.prefix + key);
    }

    addToSettingsFolder(uiFolder) {
        const uniforms = Object.entries(this.settings);
        
        uniforms.forEach(([key, value]) => {

            var controller;  

            const isFloatValue = typeof value === 'object';

            if(isFloatValue) {
                const uniform = value as FloatUniform;
                controller = uiFolder.add(uniform, "value", uniform.min, uniform.max, uniform.step);        
            }
            else {
                console.log("add option : "+key);
                controller = uiFolder.addColor(this.settings, key);        
            }

            controller.name(key);  
        });
    }
}