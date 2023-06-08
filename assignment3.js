import { defs, tiny } from "./examples/common.js";
import { Ball } from "./new-scripts/ball.js";
import { Flipper } from "./new-scripts/flipper.js";
import { Obstacle, Cylindrical, Rectangular } from "./new-scripts/obstacles.js";
import { PhysicsCalculations } from "./new-scripts/physics-calculations.js";
import { Debug_Point } from "./new-scripts/visual_debugger.js";
import { Scoreboard} from "./new-scripts/scoreboard.js";

const {Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture} = tiny;
const {Textured_Phong} = defs

export class Assignment3 extends Scene {
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
    };

    // *** Materials
    this.materials = {
      test: new Material(new defs.Phong_Shader(), {
        ambient: 0.4, diffusivity: 0.5, specularity: 0, color: hex_color("#b3abff"),
      }),
      /*ball: new Material(new defs.Phong_Shader(), {
        ambient: 1, diffusivity: 1, specularity: 1, color: hex_color("#888888"),
      }),*/
      ball: new Material(new Textured_Phong(), {
        ambient: 1, specularity: 1, color: hex_color("#000000"), texture: new Texture(("assets/fire.jpg"))
      }),
      circular_bouncer: new Material(new Gouraud_Shader(), {
        ambient: 0.4, diffusivity: 1, specularity: 0.5, color: hex_color("#ff0000"),
      }),
      debug_material: new Material(new Gouraud_Shader(), {
        ambient: 1, diffusivity: 1, color: hex_color("#ff0000"),
      }),
      obstacle: new Material(new Textured_Phong(), {
        ambient: 1, color: hex_color("#000000"), texture: new Texture("assets/rock.jpg")
      }),
      background: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/stars.jpg")
      }),
      wall: new Material(new Textured_Phong(), {
        color: hex_color("#000000"), ambient: 1, texture: new Texture("assets/metal.jpg")
      }),
    };

    this.initial_camera_location = Mat4.look_at(
      vec3(0, -60, 60), vec3(0, 0, 0), vec3(0, 1, 0)
    );

    this.PhysicsCalculations = new PhysicsCalculations();
    this.Ball = new Ball(
      this.shapes.sphere, this.materials.ball, vec3(0, 10, 0), vec3(this.get_random_float(-20,20), this.get_random_float(-6,6), 0),this
      //vec3(0, 6, 0),
      //vec3(0, 0, 0),
    );
    this.circular_bouncer = new Cylindrical(
      this.shapes.torus, this.materials.circular_bouncer, vec3(0, 0, 0), 1
    );
    this.background = new Rectangular(
      this.shapes.cube, this.materials.background, vec3(0, 0, 0), 1, 30, 35, -1, 0, 0.1
    );
    // this.bot_wall_left = new Rectangular(
    //   this.shapes.cube, this.materials.wall, vec3(-20, -21, 0), .5, 10, vec3(0, -36, 0), 1.2, 30, 1, 0, -30, 1
    // );
    // this.bot_wall_right = new Rectangular(
    //     this.shapes.cube, this.materials.wall, vec3(20, -21, 0), .5, 10, 1, 0, 30, 1
    // );
    this.bot_wall = new Rectangular(
        this.shapes.cube, this.materials.wall, vec3(0, -36, 0), 1, 30, 1, 0, 0, 1
    );
    this.top_wall = new Rectangular(
      this.shapes.cube, this.materials.wall, vec3(0, 36, 0), 0.5, 30, 1, 0, 0, 1
    );
    this.left_wall = new Rectangular(
      this.shapes.cube, this.materials.wall, vec3(-31, 0, 0), 1, 1, 37, 0, 0, 1
    );
    this.right_wall = new Rectangular(
      this.shapes.cube, this.materials.wall, vec3(31, 0, 0), 1, 1, 37, 0, 0, 1
    );
    this.obstacle1 = new Rectangular(
      this.shapes.cube, this.materials.obstacle, vec3(-10, 10, 0), 1, 3, 1, 0, -30, 1
    );
    this.obstacle2 = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(-15, -15, 0), 1, 3, 1, 0, 30, 1
    );
    this.obstacle3 = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(15, 15, 0), 1, 3, 1, 0, 60, 1
    );
    this.obstacle4 = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(10, 0, 0), 1, 3, 1, 0, -60, 1
    );
    this.obstacle5 = new Rectangular(
        this.shapes.cube, this.materials.obstacle, vec3(20, -10, 0), 1, 3, 1, 0, 50, 1
    );
    this.scoreboard = new Scoreboard(vec3(45, 0, 0));

    this.LeftKeyDown = false;
    this.RightKeyDown = false;
    this.LeftKeyLast = false;
    this.RightKeyLast = false;

    this.LeftFlipper = new Flipper(this.shapes.cube, this.materials.obstacle, vec3(-14,-25,0), this, true);
    this.RightFlipper = new Flipper(this.shapes.cube, this.materials.obstacle, vec3(14,-25,0), this, false);

    this.obstacles = [
       // this.bot_wall_left,
       // this.bot_wall_right,
       this.bot_wall,
       this.top_wall,
       this.left_wall,
       this.right_wall,
       this.obstacle1,
       this.obstacle2,
       this.obstacle3,
       this.obstacle4,
       this.obstacle5,
    ];

    this.flippers = [
        this.LeftFlipper,
        this.RightFlipper
    ];

    this.debug_points = [];
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.

    //super.make_control_panel();
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
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
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

    this.Ball.update_object(context, program_state);
    //this.circular_bouncer.render(context, program_state, model_transform);
    this.background.render(context, program_state);
    // this.bot_wall_left.render(context, program_state);
    // this.bot_wall_right.render(context, program_state);
    this.bot_wall.render(context, program_state);
    this.top_wall.render(context, program_state);
    this.left_wall.render(context, program_state);
    this.right_wall.render(context, program_state);
    this.obstacle1.render(context, program_state);
    this.obstacle2.render(context, program_state);
    this.obstacle3.render(context, program_state);
    this.obstacle4.render(context, program_state);
    this.obstacle5.render(context, program_state);
    this.scoreboard.render(context, program_state);

    this.handle_flippers(context, program_state);
    const start = [0, 0];
    const end = [5, 0];
    const circle_center = [4, 4];
    const circle_radius = 2.9;
    //console.log("starting");
    let res = this.PhysicsCalculations.findCircleIntersectionPoint(
      start,
      end,
      circle_center,
      circle_radius
    );
    //console.log("result,", res);
    this.debug_points = [];

    this.scoreboard.incrementScore();
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
