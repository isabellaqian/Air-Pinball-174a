import { defs, tiny } from "./examples/common.js";
import { Ball } from "./new-scripts/ball.js";
import { Flipper } from "./new-scripts/flipper.js";
import { Obstacle, Cylindrical, Rectangular } from "./new-scripts/obstacles.js";
import { PhysicsCalculations } from "./new-scripts/physics-calculations.js";
import { Debug_Point } from "./new-scripts/visual_debugger.js";
import { Scoreboard} from "./new-scripts/scoreboard.js";

const {Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture} = tiny;
const {Textured_Phong} = defs

export class TinyPinball extends Scene {
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();

    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.shapes = {
      torus: new defs.Torus(15, 15),
      torus2: new defs.Torus(3, 15),
      sphere: new defs.Subdivision_Sphere(4),
      circle: new defs.Regular_2D_Polygon(1, 15),
      cube: new defs.Cube(),
      square: new defs.Square(),
      rock_object: new defs.Cube(),
    };

    // *** Materials
    this.materials = {
      test: new Material(new defs.Phong_Shader(), {
        ambient: 0.4, diffusivity: 0.5, specularity: 0, color: hex_color("#b3abff"),
      }),
      fire: new Material(new Textured_Phong(), {
        ambient: 1, specularity: 1, color: hex_color("#000000"), texture: new Texture(("assets/fire.jpg"))
      }),
      debug_material: new Material(new Gouraud_Shader(), {
        ambient: 1, diffusivity: 1, color: hex_color("#ff0000"),
      }),
      obstacle: new Material(new Textured_Phong(), {
        ambient: 1, color: hex_color("#000000"), texture: new Texture("assets/metal.jpg")
      }),
      background: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/stars.jpg")
      }),
      wall: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/metal.jpg")
      }),
      headboard: new Material(new Textured_Phong(), {
        ambient: 1, specularity: 0,  texture: new Texture("assets/tinypinball.png")
      }),
      gold_target: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/gold.jpg")
      }),
      jupiter_target: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/jupiter.jpg")
      }),
      planet_target: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/earth.gif")
      }),
      rock_target: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/rock.jpg")
      }),
      neptune_target: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/neptune.jpg")
      }),
      mars_target: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/mars.jpg")
      }),
      venus_target: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/venus.jpg")
      }),

    };

    this.isPlaying = false;
    this.scoreReset = false;
    this.start_camera_location = Mat4.look_at(
      vec3(0, -55, 15), vec3(0, 0, 10), vec3(0, 1, 0)
    );
    this.play_camera_location = Mat4.look_at(
        vec3(0, -60, 60), vec3(0, 0, 0), vec3(0, 1, 0)
    );

    this.PhysicsCalculations = new PhysicsCalculations();
    this.Ball = new Ball(
      this.shapes.sphere, this.materials.fire, vec3(0, 10, 0), vec3(this.get_random_float(-20,20), this.get_random_float(-6,6), 0), this
    );
    this.background = new Rectangular(
      this.shapes.cube, this.materials.background, vec3(0, 0, 0), 1, 30, 35, -1, 0, 0.1
    );
    this.bot_wall_left = new Rectangular(
        this.shapes.cube, this.materials.wall, vec3(-20, -21, 0), 0.7, 11, 1, 0, -30, 1,
    );
    this.bot_wall_right = new Rectangular(
        this.shapes.cube, this.materials.wall, vec3(20, -21, 0), 0.7, 11, 1, 0, 30, 1,
    );
    this.top_wall = new Rectangular(
      this.shapes.cube, this.materials.wall, vec3(0, 36, 0), 0.7, 30, 1, 0, 0, 1,
    );
    this.left_wall = new Rectangular(
      this.shapes.cube, this.materials.wall, vec3(-31, 0, 0), 0.7, 1, 36, 0, 0, 1
    );
    this.right_wall = new Rectangular(
      this.shapes.cube, this.materials.wall, vec3(31, 0, 0), 0.7, 1, 36, 0, 0, 1
    );
    this.headboard = new Rectangular(
      this.shapes.cube, this.materials.headboard, vec3(0, 38, 0), 1, 32, 1, 20, 0, 21
    );
    this.top_bar = new Rectangular(
      this.shapes.cube, this.materials.wall, vec3(0, 36, 2), 1, 30, 1, 39, 0, 2
    );
    this.right_ear = new Rectangular(
        this.shapes.cube, this.materials.wall, vec3(-35, 36, 0), 1, 5, 1, 20,0, 21
    );
    this.left_ear = new Rectangular(
        this.shapes.cube, this.materials.wall, vec3(35, 36, 0), 1, 5, 1, 20,0, 21
    );
    this.jupiter = new Rectangular(
      this.shapes.cube, this.materials.jupiter_target, vec3(-8, 0, 0), 0.9, 3, 3, 0, 45, 1, 10
    );
    this.bottom_left_target = new Rectangular(
        this.shapes.rock_object, this.materials.rock_target, vec3(-21, -8, 0), 0.8, 1, 8, 0, 30, 1, 5
    );
    this.bottom_right_target = new Rectangular(
        this.shapes.rock_object, this.materials.rock_target, vec3(21, -8, 0), 0.8, 1, 8, 0, -30, 1, 5
    );
    this.bottom_right_target.shape.arrays.texture_coord.forEach(
        (v, i, l) => v[1] = v[1] * 8
  )
    this.planet1 = new Rectangular(
        this.shapes.cube, this.materials.planet_target, vec3(10, -15, 0), 1, 1.5, 1.5, 0, 20, 1, 20,
    );
    this.planet2 = new Rectangular(
        this.shapes.cube, this.materials.planet_target, vec3(-25, 15, 0), 1, 1.5, 1.5, 0, 60, 1, 20,
    );
    this.chute_left = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(14, 13.5, 0), 0.7, 1, 4.5, 0, -30, 1
    );
    this.chute_right = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(20, 10, 0), 0.7, 1, 4.5, 0, -30, 1
    );
    this.chute_top = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(20, 17, 0), 0.7, 1, 4.5, 0, 60, 1
    );
    this.chute_target = new Rectangular(
        this.shapes.cube, this.materials.gold_target, vec3(19, 15, 0), 1.5, 1, 2.2, 0, 60, 1, 100
    );
    this.top_target = new Rectangular(
        this.shapes.cube, this.materials.gold_target, vec3(0, 34, 0), 1.5, 2, 1, 0, 0, 1, 100
    );
    this.top_target_left = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(-3, 34, 0), 0.7, 1, 1, 0, 0, 1,
    );
    this.top_target_right = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(3, 34, 0), 0.7, 1, 1, 0, 0, 1,
    );
    this.corner_left_target = new Rectangular(
        this.shapes.cube, this.materials.gold_target, vec3(-29, 34, 0), 1.5, 2, 1, -0.1, 45, 1, 100
    );
    this.corner_right_target = new Rectangular(
        this.shapes.cube, this.materials.gold_target, vec3(29, 34, 0), 1.5, 2, 1, -0.1, -45, 1, 100
    );
    this.neptune = new Rectangular(
        this.shapes.cube, this.materials.neptune_target, vec3(-15, 25, 0), 1.2, 2, 2, 0, 60, 1, 40
    );
    this.mars = new Rectangular(
        this.shapes.cube, this.materials.mars_target, vec3(5, 15, 0), 1.1, 1, 1, 0, 30, 1, 30
    );
    this.venus = new Rectangular(
        this.shapes.cube, this.materials.venus_target, vec3(15, 27, 0), 1.3, 1.5, 1.5, 0, 15, 1, 50
    );
    this.scoreboard = new Scoreboard(vec3(-6, 37, 14)
    );

    this.LeftKeyDown = false;
    this.RightKeyDown = false;
    this.LeftKeyLast = false;
    this.RightKeyLast = false;

    this.LeftFlipper = new Flipper(this.shapes.cube, this.materials.fire, vec3(-14,-25,0), this, true);
    this.RightFlipper = new Flipper(this.shapes.cube, this.materials.fire, vec3(14,-25,0), this, false);

    this.obstacles = [
        this.bot_wall_left,
        this.bot_wall_right,
        this.top_wall,
        this.left_wall,
        this.right_wall,
        this.jupiter,
        this.bottom_left_target,
        this.bottom_right_target,
        this.planet1,
        this.planet2,
        this.chute_left,
        this.chute_top,
        this.chute_right,
        this.chute_target,
        this.top_target,
        this.top_target_left,
        this.top_target_right,
        this.corner_left_target,
        this.corner_right_target,
        this.neptune,
        this.mars,
        this.venus,
        this.LeftFlipper,
        this.RightFlipper,
    ];

    this.flippers = [
        this.LeftFlipper,
        this.RightFlipper
    ];

    this.debug_points = [];
  }

  make_control_panel() {
    this.new_line();
    this.key_triggered_button("Start", ["Enter"],
        () => this.isPlaying = true, "#6E6460", () => this.scoreboard.resetScore());
    this.key_triggered_button("Quit", ["q"],
        () => this.isPlaying = false);
    this.new_line();
    this.key_triggered_button("Left Flipper", ["x"],
        () => this.LeftKeyDown = true, "#6E6460", () => this.LeftKeyDown = false);

    this.key_triggered_button("Right Flipper", ["m"],
        () => this.RightKeyDown = true, "#6E6460", () => this.RightKeyDown = false);
  }

  get_random_float(min, max) {
    return Math.random() * (max - min) + min;
  }

  handle_flippers(context, program_state){

    this.LeftFlipper.update_object(context, program_state);
    this.RightFlipper.update_object(context, program_state);

    if (this.LeftKeyLast !== this.LeftKeyDown) {
      this.LeftKeyLast = this.LeftKeyDown;
      if (this.LeftKeyDown){
        this.LeftFlipper.flick();
      }
    }

    if (this.RightKeyLast !== this.RightKeyDown) {
      this.RightKeyLast = this.RightKeyDown;
      if (this.RightKeyDown){
        this.RightFlipper.flick();
      }
    }
  }

  display(context, program_state) {

    // display():  Called once per frame of animation.
    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
    program_state.set_camera(this.start_camera_location);
    }

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );

    const light_position = vec4(0, 5, 100, 1);
    // The parameters of the Light are: position, color, size
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];


    //this.circular_bouncer.render(context, program_state, model_transform);
    this.background.render(context, program_state);
    this.headboard.render(context, program_state);
    this.top_bar.render(context, program_state);
    this.right_ear.render(context, program_state);
    this.left_ear.render(context, program_state);
    this.scoreboard.render(context, program_state);

    for (let i = 0; i < this.obstacles.length; i++)
      this.obstacles[i].render(context, program_state);

    if (this.isPlaying) {
      program_state.camera_inverse = this.play_camera_location.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.05));
      this.Ball.update_object(context, program_state);
      if (this.Ball.position[1] < -40) {
        this.isPlaying = false;
        this.scoreReset = false;
      }
      if (!this.scoreReset){
        //this.score = 0;
        this.scoreReset = true;
      }
    }
    else {
      this.Ball.reset_object(context, program_state);
      program_state.camera_inverse = this.start_camera_location.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.05));
    }

    this.handle_flippers(context, program_state);

    this.debug_points = [];
  }
}

class Gouraud_Shader extends Shader {
  // This is a Shader using Phong_Shader as template
  // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

  constructor(num_lights = 2) {
    super();
    this.num_lights = num_lights;
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return (
      ` 
        precision mediump float;
        const int N_LIGHTS = ` +
      this.num_lights +
      `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `
    );
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    return (
      this.shared_glsl_code() +
      `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
            } `
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    return (
      this.shared_glsl_code() +
      `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `
    );
  }

  send_material(gl, gpu, material) {
    // send_material(): Send the desired shape-wide material qualities to the
    // graphics card, where they will tweak the Phong lighting formula.
    gl.uniform4fv(gpu.shape_color, material.color);
    gl.uniform1f(gpu.ambient, material.ambient);
    gl.uniform1f(gpu.diffusivity, material.diffusivity);
    gl.uniform1f(gpu.specularity, material.specularity);
    gl.uniform1f(gpu.smoothness, material.smoothness);
  }

  send_gpu_state(gl, gpu, gpu_state, model_transform) {
    // send_gpu_state():  Send the state of our whole drawing context to the GPU.
    const O = vec4(0, 0, 0, 1),
      camera_center = gpu_state.camera_transform.times(O).to3();
    gl.uniform3fv(gpu.camera_center, camera_center);
    // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
    const squared_scale = model_transform
      .reduce((acc, r) => {
        return acc.plus(vec4(...r).times_pairwise(r));
      }, vec4(0, 0, 0, 0))
      .to3();
    gl.uniform3fv(gpu.squared_scale, squared_scale);
    // Send the current matrices to the shader.  Go ahead and pre-compute
    // the products we'll need of the of the three special matrices and just
    // cache and send those.  They will be the same throughout this draw
    // call, and thus across each instance of the vertex shader.
    // Transpose them since the GPU expects matrices as column-major arrays.
    const PCM = gpu_state.projection_transform
      .times(gpu_state.camera_inverse)
      .times(model_transform);
    gl.uniformMatrix4fv(
      gpu.model_transform,
      false,
      Matrix.flatten_2D_to_1D(model_transform.transposed())
    );
    gl.uniformMatrix4fv(
      gpu.projection_camera_model_transform,
      false,
      Matrix.flatten_2D_to_1D(PCM.transposed())
    );

    // Omitting lights will show only the material color, scaled by the ambient term:
    if (!gpu_state.lights.length) return;

    const light_positions_flattened = [],
      light_colors_flattened = [];
    for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
      light_positions_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].position[i % 4]
      );
      light_colors_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].color[i % 4]
      );
    }
    gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
    gl.uniform4fv(gpu.light_colors, light_colors_flattened);
    gl.uniform1fv(
      gpu.light_attenuation_factors,
      gpu_state.lights.map((l) => l.attenuation)
    );
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
    // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
    // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
    // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
    // program (which we call the "Program_State").  Send both a material and a program state to the shaders
    // within this function, one data field at a time, to fully initialize the shader for a draw.

    // Fill in any missing fields in the Material object with custom defaults for this shader:
    const defaults = {
      color: color(0, 0, 0, 1),
      ambient: 0,
      diffusivity: 1,
      specularity: 1,
      smoothness: 40,
    };
    material = Object.assign({}, defaults, material);

    this.send_material(context, gpu_addresses, material);
    this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
  }
}

class Ring_Shader extends Shader {
  update_GPU(
    context,
    gpu_addresses,
    graphics_state,
    model_transform,
    material
  ) {
    // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
    const [P, C, M] = [
        graphics_state.projection_transform,
        graphics_state.camera_inverse,
        model_transform,
      ],
      PCM = P.times(C).times(M);
    context.uniformMatrix4fv(
      gpu_addresses.model_transform,
      false,
      Matrix.flatten_2D_to_1D(model_transform.transposed())
    );
    context.uniformMatrix4fv(
      gpu_addresses.projection_camera_model_transform,
      false,
      Matrix.flatten_2D_to_1D(PCM.transposed())
    );
  }

  shared_glsl_code() {
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
  }

  vertex_glsl_code() {
    // ********* VERTEX SHADER *********
    // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    return (
      this.shared_glsl_code() +
      `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          
        }`
    );
  }

  fragment_glsl_code() {
    // ********* FRAGMENT SHADER *********
    // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    return (
      this.shared_glsl_code() +
      `
        void main(){
          
        }`
    );
  }
}
