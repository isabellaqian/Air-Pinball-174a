import {defs, tiny} from '../examples/common.js';
import {PhysicsCalculations} from "./physics-calculations.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Ball {
    constructor(shape, material, position, velocity, scene) {
        this.shape = shape;
        this.material = material;
        this.position = position;
        this.velocity = velocity;
        this.gravity = -10; //-300
        this.bounciness = .95;
        this.scene = scene;

        this.travel_segment_start = vec3(0, 0, 0);
        this.travel_segment_end = vec3(0, 0, 0);

        this.dt = 0;

        this.PhysicsCalculations = new PhysicsCalculations();
    }

    update_object(context, program_state) {
        this.dt = program_state.animation_delta_time / 1000;
        this.velocity[1] = this.velocity[1] + this.gravity * this.dt;

        this.update_position();

        this.render(context, program_state);
    }

    update_position() {
        this.travel_segment_start = this.position;
        this.position = this.position.plus(this.velocity.times(this.dt));
        this.travel_segment_start = this.position;

        for (let i = 0; i < this.scene.obstacles.length; i++) {
            this.handle_obstacle_collision(this.scene.obstacles[i]);
        }
        this.handle_boundary_collision(8, 6);
    }

    collide(normal, bounciness, collision_point) {

        let travel_proportion =
            this.PhysicsCalculations.magnitude(vec3(this.travel_segment_start[0] - collision_point[0], this.travel_segment_start[1] - collision_point[1], 0))
            / this.PhysicsCalculations.magnitude(vec3(this.travel_segment_start[0] - this.travel_segment_end[0], this.travel_segment_start[1] - this.travel_segment_end[1], 0));

        this.dt = this.dt * (1 - travel_proportion);

        this.update_bounce_velocity(normal, bounciness);
        this.position = collision_point;
    }

    update_bounce_velocity(normal, bounciness) {

        let tangent = vec3(normal[1], -normal[0], 0)

        let normal_component_magnitude = this.PhysicsCalculations.dot_product(this.velocity, normal)
            / this.PhysicsCalculations.sqr_magnitude(normal);

        let normal_component = vec3(normal_component_magnitude * normal[0], normal_component_magnitude * normal[1], 0);

        let tangent_component_mag = this.PhysicsCalculations.dot_product(this.velocity, tangent)
            / this.PhysicsCalculations.sqr_magnitude(tangent);

        let tangent_component = vec3(tangent_component_mag * tangent[0], tangent_component_mag * tangent[1], 0);

        this.velocity = vec3((-normal_component[0] + tangent_component[0]) * bounciness * this.bounciness, (-normal_component[1] + tangent_component[1]) * bounciness * this.bounciness, 0);

        return;

        if (this.PhysicsCalculations.sqr_magnitude(this.velocity) < this.dt * 2500){
            this.velocity[0] = 0;
            this.velocity[1] = 0;
        }

        //this.update_position();
    }

    handle_obstacle_collision(obstacle) {
        let collision_point = null;

        console.log("checking: \n" + obstacle.vertices[0] +
            "\n" + obstacle.vertices[1] +
            "\n" + obstacle.vertices[2] +
            "\n" + obstacle.vertices[3]
        );

        for (let i = 0; i < obstacle.vertices.length - 1; i++)
        {
            collision_point = this.PhysicsCalculations.findIntersectionPoint(this.travel_segment_start, this.travel_segment_end, obstacle.vertices[i], obstacle.vertices[i + 1]);

            if (collision_point !== null) {
                this.collide(this.PhysicsCalculations.normal_of_line_segment(obstacle.vertices[i], obstacle.vertices[i + 1]),1, collision_point);
            }
        }
    }

    handle_boundary_collision(width, height) {

        //wall_points are denoted in pairs of points that make up a line segment
        const wall_points = [
            vec3(-999, 999 * .7, 0), vec3(0, -height, 0),
            vec3(0, -height, 0), vec3(999, 999 * .7, 0),

            vec3(-999, height, 0), vec3(999, height, 0),
            vec3(-width, -999, 0), vec3(-width, 999, 0),
            vec3(width, -999, 0), vec3(width, 999, 0)
        ];

        let collision_point = null;

        for (let i = 0; i < wall_points.length; i += 2)
        {
            collision_point = this.PhysicsCalculations.findIntersectionPoint(this.travel_segment_start, this.travel_segment_end, wall_points[i], wall_points[i + 1]);

            if (collision_point !== null){
                //this.collide(this.PhysicsCalculations.normal_of_line_segment(wall_points[i], wall_points[i + 1]),1, collision_point);
            }
        }
    }

    //this.shapes.torus.draw(context, program_state, model_transform, this.materials.test.override({color: yellow}));
    render(context, program_state) {
        this.shape.draw(context, program_state, Mat4.identity().times(Mat4.translation(this.position[0],this.position[1],this.position[2])), this.material);
    }
}