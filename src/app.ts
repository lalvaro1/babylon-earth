import * as dat from 'dat.gui';
import { InteractiveFloatUniforms } from "./InteractiveFloatUniforms";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, Color4, Mesh, MeshBuilder, ShaderMaterial, Texture } from "@babylonjs/core";

function createMaterial(name: string, scene: Scene, customUniforms : string[] = []) {

    const uniforms = ["world", "worldView", "worldViewProjection", "view", "projection", "cameraPosition", "time", "ratio", ...customUniforms];

    return new ShaderMaterial("shader", scene, "./shaders/" + name,
    {
        attributes: ["position", "normal", "uv"],
        uniforms: uniforms
    });   
}

const heroes = ['Batman', 'Superman'];
const villains : string[] = [];
const all = ["he", "ggt", ...villains];



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
        var clouds: Mesh = MeshBuilder.CreateSphere("clouds", { diameter: 1.010 }, scene);   
        clouds.checkCollisions = true;


        const planeOptions = { width : 4, height: 4};

        var scatter: Mesh = MeshBuilder.CreatePlane("plane", planeOptions, scene); 
        scatter.billboardMode = Mesh.BILLBOARDMODE_ALL;

        earth.renderingGroupId = 0;
        clouds.renderingGroupId = 1;        
        scatter.renderingGroupId = 2;                

        camera.position = new Vector3(0,0.5,-1.);
        camera.wheelPrecision = 200;
        camera.minZ = 0.1;

        scene.collisionsEnabled = true;
        camera.collisionRadius = new Vector3(0.2, 0.2, 0.2);
        camera.checkCollisions = true;

        // earth
        var earthProceduralMaterial = createMaterial("earth", scene);  
        earth.material = earthProceduralMaterial;

        earthProceduralMaterial.setTexture("diffuse", new Texture("./textures/earth.jpg", scene));
        earthProceduralMaterial.setTexture("normal_map", new Texture("./textures/earth_normal_map.png", scene));        
        earthProceduralMaterial.setTexture("night", new Texture("./textures/night.jpg", scene));        
        earthProceduralMaterial.setTexture("mask", new Texture("./textures/mask.png", scene));                

        // clouds
        var cloudProceduralMaterial = createMaterial("clouds", scene);  
        clouds.material = cloudProceduralMaterial;

        const cloudTexture = new Texture("./textures/clouds.jpg", scene);
        const cloudTextureAlpha = new Texture("./textures/clouds_alpha.jpg", scene);        

        cloudProceduralMaterial.setTexture("layer1", cloudTexture);
        cloudProceduralMaterial.setTexture("layer2", cloudTextureAlpha);        
        clouds.material.alpha = 0.0;

        earthProceduralMaterial.setTexture("clouds", cloudTextureAlpha);     
        earth.material = earthProceduralMaterial;

        // scattering
        var scatteringOptions = { intensity : { value : 8, min : 5, max : 50, step : 1 },
        ray: { value : 0.015,  min : 0, max : 1, step : 0.025 },
        mie : { value : 0.005, min : 0, max : 1, step : 0.025 },
        inner : { value : 0.47,  min : 0.25, max : 2, step : 0.05 },
        outter : { value : 1.23,  min : 1, max : 5, step : 0.25 },
        transition_width : { value :  0.3,  min : 0, max : 1, step : 0.05 },
        transition_power : { value : 4,  min : 0.25, max : 20, step : 0.01 }};

        const scatterUniforms = new InteractiveFloatUniforms(scatteringOptions);

        var settings = new dat.GUI();
        var folder1 = settings.addFolder('Scattering');

        scatterUniforms.addToSettingsFolder(folder1);

        var scatterProceduralMaterial = createMaterial("scatter", scene, scatterUniforms.getUniformList());   
        scatter.material = scatterProceduralMaterial;
        scatter.material.alpha = 0.0;

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
            time += engine.getDeltaTime() * 0.0005;

            scatterUniforms.updateShader(scatterProceduralMaterial);

            engine.resize();
            scene.render();
        });
    }
}
new App();



