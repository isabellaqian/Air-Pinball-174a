import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Obstacle {
    constructor(shape, material, position, bounciness) {
        this.bounciness = bounciness;
        this.position = position;
        this.shape = shape;
        this.material = material;

        this.vertices = [];
    }
    getVertices() {
        return this.vertices;
    }
}

export class Rectangular extends Obstacle {
    constructor(shape, material, position, bounciness, width, height, depth, rotation, z_scale) {
        super(shape, material, position, bounciness);
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.rotation = rotation * Math.PI / 180;
        this.z_scale = z_scale;

        let v1_prev = vec3(this.position[0] - width - 1, this.position[1] + height + 1, 0);
        let v2_prev = vec3(this.position[0] + width + 1, this.position[1] + height + 1, 0);
        let v3_prev = vec3(this.position[0] + width + 1, this.position[1] - height - 1, 0);
        let v4_prev = vec3(this.position[0] - width - 1, this.position[1] - height - 1, 0);
        const rotation_matrix = Mat4.rotation(this.rotation, 0, 0, 1);
        this.vertices.push(rotation_matrix.times(v1_prev));
        this.vertices.push(rotation_matrix.times(v2_prev));
        this.vertices.push(rotation_matrix.times(v3_prev));
        this.vertices.push(rotation_matrix.times(v4_prev));
        console.log("rotated vertices: ", this.vertices);
    }

    render(context, program_state) {
        this.shape.draw(context, program_state, Mat4.identity().times(Mat4.translation(this.position[0],this.position[1], this.depth))
            .times(Mat4.rotation(this.rotation,0,0,1))
            .times(Mat4.scale(this.width, this.height, this.z_scale)), this.material);
    }
}

export class Cylindrical extends Obstacle {
    constructor(shape, material, position, bounciness, radius) {
        super(shape, material, position, bounciness);
        this.radius = radius;
    }

    render(context, program_state) {
        this.shape.draw(context, program_state, Mat4.identity().times(Mat4.translation(this.position[0],this.position[1],this.position[2])), this.material);
    }
}