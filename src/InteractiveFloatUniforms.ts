import { ShaderMaterial } from "@babylonjs/core";

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

    updateShader(material : ShaderMaterial) {
        const uniforms = Object.entries(this.settings);
        
        uniforms.forEach(([key, value]) => {
            const uniform = value as FloatUniform;
            material.setFloat(this.prefix + key, uniform.value);          
        });
    }

    getUniformList() {
        return Object.keys(this.settings).map((key) => this.prefix + key);
    }

    addToSettingsFolder(uiFolder) {
        const uniforms = Object.entries(this.settings);
        
        uniforms.forEach(([key, value]) => {
            const uniform = value as FloatUniform;
            const controller = uiFolder.add(uniform, "value", uniform.min, uniform.max, uniform.step);        
            controller.name(key);  
        });
    }
}