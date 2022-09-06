import * as dat from 'dat.gui';
import { InteractiveFloatUniforms } from "./InteractiveFloatUniforms";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, Color4, Mesh, MeshBuilder, ShaderMaterial, Texture, Vector4, ColorSplitterBlock } from "@babylonjs/core";

function createMaterial(name: string, scene: Scene, customUniforms : string[] = []) {

    const uniforms = ["world", "worldView", "worldViewProjection", "view", "projection", "cameraPosition", "time", "ratio", "sun", ...customUniforms];

    return new ShaderMaterial("shader", scene, "./shaders/" + name,
    {
        attributes: ["position", "normal", "uv"],
        uniforms: uniforms
    });   
}

const heroes = ['Batman', 'Superman'];
const villains : string[] = [];
const all = ["he", "ggt", ...villains];


function colorToVec4(color: String) : Vector4 {
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(6,7), 16);
    const a = parseInt(color.slice(7,8), 16);    

    return new Vector4(r,g,b,a);
}


class App {
    constructor() {

        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);
        // initialize babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);
        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        scene.clearColor = new Color4(0, 0, 0, 1);

        var earth: Mesh = MeshBuilder.CreateSphere("earth", { diameter: 1 }, scene);
        var clouds: Mesh = MeshBuilder.CreateSphere("clouds", { diameter: 1.020 }, scene);   
        clouds.checkCollisions = true;

        const planeOptions = { width : 1.33, height: 1.33 };

        var scatter: Mesh = MeshBuilder.CreatePlane("plane", planeOptions, scene); 
        scatter.billboardMode = Mesh.BILLBOARDMODE_ALL;

        earth.renderingGroupId = 0;
        clouds.renderingGroupId = 1;        
        scatter.renderingGroupId = 2;                
        
        clouds.parent = earth;

        camera.position = new Vector3(0,0.5,-1.);
        camera.wheelPrecision = 200;
        camera.minZ = 0.1;

        scene.collisionsEnabled = true;
        camera.collisionRadius = new Vector3(0.2, 0.2, 0.2);
        camera.checkCollisions = true;

        // earth
        var earthProceduralMaterial = createMaterial("earth", scene);  
        earth.material = earthProceduralMaterial;

        const earthTexture = new Texture("./textures/earth.jpg", scene);    

        earthProceduralMaterial.setTexture("diffuse", earthTexture);
        earthProceduralMaterial.setTexture("normal_map", new Texture("./textures/earth_normal_map.png", scene));        
        earthProceduralMaterial.setTexture("night", new Texture("./textures/night2.jpg", scene));        
        earthProceduralMaterial.setTexture("mask", new Texture("./textures/mask.png", scene));                

        // clouds
        var cloudProceduralMaterial = createMaterial("clouds", scene);  
        clouds.material = cloudProceduralMaterial;

        const cloudShadowTexture = new Texture("./textures/clouds_shadow.jpg", scene);
        const cloudAlphaTexture = new Texture("./textures/clouds_alpha.jpg", scene);//, false, true, Texture.BILINEAR_SAMPLINGMODE);    
        //const scatteringTexture = new Texture("./textures/scattering.png", scene);                

        cloudAlphaTexture.wrapU = Texture.WRAP_ADDRESSMODE;
        cloudAlphaTexture.wrapV = Texture.WRAP_ADDRESSMODE;        
        cloudAlphaTexture.wrapR = Texture.WRAP_ADDRESSMODE;    


        cloudProceduralMaterial.setTexture("layer1", cloudShadowTexture);
        cloudProceduralMaterial.setTexture("layer2", cloudAlphaTexture);        
        //cloudProceduralMaterial.setTexture("scattering", scatteringTexture);                
        clouds.material.alpha = 0.0;

        earthProceduralMaterial.setTexture("clouds", cloudShadowTexture);     
        earth.material = earthProceduralMaterial;

        // ground settings
        var groundOptions = { 
            specular : { value : 0.20, min : 0, max : 1, step : 0.01 },
            diffuse : { value : 1., min : 0, max : 1, step : 0.01 },            
            specular_power : { value : 3.5, min : 1., max : 15, step : 0.005 },                        
            diffuse_power : { value : 1., min : 0.25, max : 2, step : 0.01 },                                    
            day_ambient : { value : 0.2, min : 0, max : 1, step : 0.01 },            
            night_boost : { value : 0.8, min : 0., max : 2, step : 0.01 },                                    
            night_day_threshold : { value : 0.0, min : 0, max : 0.15, step : 0.005 },            
            night_day_transition : { value : 0.2, min : 0, max : 0.2, step : 0.005 },      
            cloud_shadow : { value : 0.59, min : 0, max : 1, step : 0.005 },       
            bump : { value : 0.125, min : 0.05, max : 0.5, step : 0.001 },                        
        };
        const groundUniforms = new InteractiveFloatUniforms(groundOptions);

        // scattering
        var scatteringOptions = { 
            intensity : { value : 27, min : 0, max : 50, step : 0.5 },
            ray: { value : 0.0022,  min : 0, max : 0.05, step : 0.00025 },
            mie : { value : 0.002, min : 0.001, max : 0.05, step : 0.00025 },
            inner : { value : 0.493,  min : 0.4, max : 0.6, step : 0.001 },
            outter : { value : 1.23,  min : 1, max : 5, step : 0.01 },
            transition_width : { value :  0.415,  min : 0, max : 0.5, step : 0.0025 },
            transition_power : { value : 2.88,  min : 0.25, max : 20, step : 0.0025 },
            outter_clipping :  { value : 0.52,  min : 0.5, max : 0.8, step : 0.0025 },
        };
        const scatterUniforms = new InteractiveFloatUniforms(scatteringOptions);

        // clouds
        var cloudOptions = { 
            specular : { value : 1., min : 0, max : 1, step : 0.01 },
            diffuse : { value : 1., min : 0, max : 1, step : 0.01 },            
            specular_power : { value : 12.5, min : 1., max : 50, step : 0.1 },     
            diffuse_threshold : { value : 0.4, min : 0., max : 1, step : 0.005 },                       
            ambient : { value : 0.18, min : 0, max : 1, step : 0.01 },         
            meoband : { value : 0.5, min : 0, max : 1, step : 0.01 },   
            normal_cheating_threshold : { value : 0.1, min : 0., max : 1, step : 0.01 },   
            normal_cheating_transition : { value : 0.14, min : 0., max : 0.5, step : 0.01 },               
        };
        const cloudUniforms = new InteractiveFloatUniforms(cloudOptions);

        // general settings
        var generalOptions = { 
            rotationSpeed : 0.02,
            sunPosition : -1.13,
        };

        clouds.setEnabled(true);
        scatter.setEnabled(true);

        var scatterProceduralMaterial = createMaterial("scatter", scene, scatterUniforms.getUniformList());   
        scatter.material = scatterProceduralMaterial;
        scatter.material.alpha = 0.0;

        var sun = new Vector3(3., -0.25, 1.);

        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });
        // run the main render loop
        var time = 0;

        engine.runRenderLoop(() => {

            const canvas = document.createElement("canvas");

            const ratio : number = canvas.width/canvas.height;
            scatterProceduralMaterial.setFloat("ratio", ratio);
            earthProceduralMaterial.setFloat("time", time);
            cloudProceduralMaterial.setFloat("time", time);
            scatterProceduralMaterial.setFloat("time", time);

            scatterProceduralMaterial.setVector3("sun", sun);
            earthProceduralMaterial.setVector3("sun", sun);
            cloudProceduralMaterial.setVector3("sun", sun);
            scatterProceduralMaterial.setVector3("sun", sun);

            const dt = engine.getDeltaTime() * 0.001;    
            earth.rotation.y += dt * generalOptions.rotationSpeed;
            time += dt;

            const sunAngle = -camera.alpha+generalOptions.sunPosition;    
            sun = new Vector3(Math.cos(sunAngle), -0.15, Math.sin(sunAngle));

            scatterUniforms.updateShader(scatterProceduralMaterial);
            cloudUniforms.updateShader(cloudProceduralMaterial);
            groundUniforms.updateShader(earthProceduralMaterial);            

            engine.resize();
            scene.render();
        });

        var settingsUI = new dat.GUI();
        const generalFolder = settingsUI.addFolder('General Settings');
        generalFolder.add(generalOptions, 'rotationSpeed', 0, 0.25, 0.01);        
        generalFolder.add(generalOptions, 'sunPosition', -3.1415, 3.1415, 0.01);                

        scatterUniforms.addToSettingsFolder(settingsUI.addFolder('Scattering'));
        groundUniforms.addToSettingsFolder(settingsUI.addFolder('Ground'));        
        cloudUniforms.addToSettingsFolder(settingsUI.addFolder('Clouds'));
    }
}
new App();



