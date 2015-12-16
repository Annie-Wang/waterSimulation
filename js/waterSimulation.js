    var scene, camera, renderer, controls;
    var geometry, material, mesh, meshFire;
    var light;

    //water parameters
    var parameters = {
        width: 1000000,
        height: 1000000,
        widthSegments: 250,
        heightSegments: 250,
        depth: 1500,
        param: 4,
        filterparam: 1
    };

    var waterNormals;

    init();
    animate();

    function init() {

        scene = new THREE.Scene();

        lightScene();

        camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000 );
        camera.position.set( 2000, 750, 2000 );
        //camera.position.z = 2000;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
         // renderer.render( scene, camera );
        document.body.appendChild( renderer.domElement );

        // Add the skybox
        // load the cube textures
        var urlPrefix   = "Images/sky/";
        var urls = [ urlPrefix + "posx.png", urlPrefix + "negx.png",
            urlPrefix + "posy.png", urlPrefix + "negy.png",
            urlPrefix + "posz.png", urlPrefix + "negz.png" ];

        var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
        reflectionCube.format = THREE.RGBFormat;

        var refractionCube = THREE.ImageUtils.loadTextureCube( urls );
        refractionCube.mapping = THREE.CubeRefractionMapping;
        refractionCube.format = THREE.RGBFormat;

        // init the cube shadder
        var shader  = THREE.ShaderLib["cube"];
        shader.uniforms[ "tCube" ].value = reflectionCube;

        var material = new THREE.ShaderMaterial( {

                    fragmentShader: shader.fragmentShader,
                    vertexShader: shader.vertexShader,
                    uniforms: shader.uniforms,
                    depthWrite: false,
                    side: THREE.BackSide

        } );

        skyboxMesh = new THREE.Mesh( new THREE.BoxGeometry( 1000000, 1000000, 1000000 ), material );
        skyboxMesh.position.y = -20000;
        scene.add( skyboxMesh );

        
        //water
        waterNormals = new THREE.ImageUtils.loadTexture( 'textures/waternormals.jpg' );
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

        water = new THREE.Water( renderer, camera, scene, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: waterNormals,
            alpha:  1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 50.0,
        } );

        mirrorMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( parameters.width, parameters.height),
            water.material
        );

        mirrorMesh.add( water );
        mirrorMesh.rotation.x = - Math.PI * 0.5;
        mirrorMesh.rotation.z = - Math.PI * 0.25;
        scene.add( mirrorMesh );


        // Setup the controls
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
        controls.enablePan = false;
        controls.minDistance = 1000.0;
        controls.maxDistance = 5000.0;
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.center.set( 0, 500, 0 );


        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {
        // update the camera
        camera.aspect   = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        // notify the renderer of the size change
        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function animate() {

      requestAnimationFrame( animate );

        //water animation
        waterrender();
       
        renderer.render( scene, camera );
    }

      function lightScene() {

        //light to make texture visible
        var ambient = new THREE.AmbientLight( 0x404040 );
        scene.add( ambient );

        light = new THREE.PointLight( 0x0066FF, 2, 0 );
        light.position.set( 0, 3000, 0 );
        scene.add( light );

      }


      function waterrender() {
        water.material.uniforms.time.value += 1.0/60;
        water.render();
    }

