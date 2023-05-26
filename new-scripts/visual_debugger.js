import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Debug_Point {
    constructor(material, position) {
        this.material = material;
        this.position = position;
        this.shape = new defs.Subdivision_Sphere(4);

        this.vertices = [];
    }

    render(context, program_state) {
        this.shape.draw(context, program_state, Mat4.identity().times(Mat4.translation(this.position[0],this.position[1], 0))
            .times(Mat4.scale(1, 1, 2)), this.material);
    }
}