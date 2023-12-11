//add canvas to body
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth
canvas.height = window.innerHeight;
//canvas force 1:1 aspect ratio
if (canvas.width > canvas.height) {
    canvas.width = canvas.height;
}
if (canvas.height > canvas.width) {
    canvas.height = canvas.width;
}
document.querySelector('#canvas').appendChild(canvas);

class Vec3 {
    constructor(x, y, z, w) {
        this.x = x? x : 0;
        this.y = y? y : 0;
        this.z = z? z : 0;
        this.w = w? w : 1;
    }
}
class Triangle {
    constructor(point1, point2, point3, color = {r: 255, g: 255, b: 255}) {
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
        this.color = color;
    }
}
class Mesh {
    constructor() {
        this.triangles = [];
    }
    addTriangle(triangle) {
        this.triangles.push(triangle);
    }
    readfromOBJFile(file) {
        let rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = () => {
            let points = [];
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    let allText = rawFile.responseText;
                    let lines = allText.split("\n");
                    for (let i = 0; i < lines.length; i++) {
                        let line = lines[i].split(" ");
                        if (line[0] == "v") {
                            let point1 = new Vec3(parseFloat(line[1]), parseFloat(line[2]), parseFloat(line[3]));
                            points.push(point1);
                        }
                        if(line[0] == "f"){
                            let triangle = new Triangle(points[parseInt(line[1])-1],points[parseInt(line[2])-1],points[parseInt(line[3])-1]);
                            this.addTriangle(triangle);
                        }
                    }
                }
            }
        }
        rawFile.send(null);
    }
}


let Cube = new Mesh();
Cube.readfromOBJFile("mountains.obj");


function drawTriangle(triangle, dp) {
    let point1 = triangle.point1;
    let point2 = triangle.point2;
    let point3 = triangle.point3;
    //if any point is negetive, set to 0
    ctx.beginPath();
    //fill triangle
    if (dp > 0) {
        ctx.fillStyle = "rgb(" + Math.floor(dp * triangle.color.r) + "," + Math.floor(dp * triangle.color.g) + "," + Math.floor(dp * triangle.color.b) + ")";
    } else {
        ctx.fillStyle = "rgb(0,0,0)";
    }
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.lineTo(point3.x, point3.y);
    ctx.lineTo(point1.x, point1.y);
    ctx.fill();
    ctx.strokeStyle = ctx.fillStyle
    // ctx.strokeStyle = 'rgb(255,255,255)'
    ctx.stroke();
}


function Vec3add(a, b) {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}
function Vec3sub(a, b) {
    return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}
function Vec3mul(a, b) {
    return new Vec3(a.x * b, a.y * b, a.z * b);
}
function CrossProduct(a, b) {
    return new Vec3(
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x);
}
function Vec3dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
function Vec3length(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}
function Vec3normalize(a) {
    let l = Vec3length(a);
    return new Vec3(a.x / l, a.y / l, a.z / l);
}
function TriangleNormal(triangle) {
    let line1 = Vec3sub(triangle.point2, triangle.point1);
    let line2 = Vec3sub(triangle.point3, triangle.point1);
    return CrossProduct(line1, line2);
}
function MatricesMultiplication(a, b) {
    let res = [];
    for (let i = 0; i < a.length; i++) {
        res[i] = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            res[i][j] = sum;
        }
    }
    return res;
}
function MatrixMakeIdentity() {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0], 
        [0, 0, 1, 0], 
        [0, 0, 0, 1]
    ];
}
function MatrixMakeRotationX(angle) {
    return [
        [1, 0, 0, 0],
        [0, Math.cos(angle), Math.sin(angle), 0],
        [0, -Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];
}
function MatrixMakeRotationY(angle) {
    return [
        [Math.cos(angle), 0, Math.sin(angle), 0],
        [0, 1, 0, 0],
        [-Math.sin(angle), 0, Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];
}
function MatrixMakeRotationZ(angle) {
    return [
        [Math.cos(angle), Math.sin(angle), 0, 0],
        [-Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0], 
        [0, 0, 0, 1]
    ];
}
function MatrixMakeTranslation(x, y, z) {
    return [
        [1, 0, 0, 0], 
        [0, 1, 0, 0], 
        [0, 0, 1, 0], 
        [x, y, z, 1]
    ];
}
function MatrixMakeProjection(fov, aspectRatio, near, far) {
    let fovRad = 1 / Math.tan(fov * 0.5 / 180 * Math.PI);
    return [
        [aspectRatio * fovRad, 0, 0, 0],
        [0, fovRad, 0, 0],
        [0, 0, far / (far - near), 1],
        [0, 0, (-far * near) / (far - near), 0]
    ];
}
function MatrixPointat(pos, target, up) {
    let newForward = Vec3sub(target, pos);
    newForward = Vec3normalize(newForward);


    //new up vector
    let a = Vec3mul(newForward, Vec3dot(up, newForward));
    let newUp = Vec3sub(up, a);
    newUp = Vec3normalize(newUp);

    let newRight = CrossProduct(newUp, newForward);

    //create translation matrix
    let matrix = MatrixMakeIdentity();
    matrix[0][0] = newRight.x;
    matrix[1][0] = newUp.x;
    matrix[2][0] = newForward.x;
    matrix[3][0] = pos.x;
    //second column
    matrix[0][1] = newRight.y;
    matrix[1][1] = newUp.y;
    matrix[2][1] = newForward.y;
    matrix[3][1] = pos.y;
    //third column
    matrix[0][2] = newRight.z;
    matrix[1][2] = newUp.z;
    matrix[2][2] = newForward.z;
    matrix[3][2] = pos.z;
    return matrix;
}
function Matrix_QuickInverse (m) {
    return [
        [m[0][0], m[1][0], m[2][0], 0],
        [m[0][1], m[1][1], m[2][1], 0],
        [m[0][2], m[1][2], m[2][2], 0],
        [
            -(m[3][0] * m[0][0] + m[3][1] * m[0][1] + m[3][2] * m[0][2]),
            -(m[3][0] * m[1][0] + m[3][1] * m[1][1] + m[3][2] * m[1][2]),
            -(m[3][0] * m[2][0] + m[3][1] * m[2][1] + m[3][2] * m[2][2]),
            1
        ]
    ];
}
function Vec3interSectionPlane(plane_p, plane_n, lineStart, lineEnd) {
    plane_n = Vec3normalize(plane_n);
    let plane_d = -Vec3dot(plane_n, plane_p);
    let ad = Vec3dot(lineStart, plane_n);
    let bd = Vec3dot(lineEnd, plane_n);
    let t = (-plane_d - ad) / (bd - ad);
    let lineStartToEnd = Vec3sub(lineEnd, lineStart);
    let lineToIntersect = Vec3mul(lineStartToEnd, t);
    return Vec3add(lineStart, lineToIntersect);
}
function TriangleClipAgainstPlane(plane_p, plane_n, triangle) {
    plane_n = Vec3normalize(plane_n);
    let plane_d = -Vec3dot(plane_n, plane_p);
    let inside_points = [];
    let outside_points = [];
    let nInsidePointCount = 0;
    let nOutsidePointCount = 0;
    let dist = (p) => {
        let n = Vec3normalize(p);
        return (plane_n.x * p.x + plane_n.y * p.y + plane_n.z * p.z - Vec3dot(plane_n, plane_p));
    }
    let d0 = dist(triangle.point1);
    let d1 = dist(triangle.point2);
    let d2 = dist(triangle.point3);
    if (d0 >= 0) {
        inside_points[nInsidePointCount++] = triangle.point1;
    } else {
        outside_points[nOutsidePointCount++] = triangle.point1;
    }
    if (d1 >= 0) {
        inside_points[nInsidePointCount++] = triangle.point2;
    } else {
        outside_points[nOutsidePointCount++] = triangle.point2;
    }
    if (d2 >= 0) {

        inside_points[nInsidePointCount++] = triangle.point3;
    } else {
        outside_points[nOutsidePointCount++] = triangle.point3;
    }
    if (nInsidePointCount == 0) {
        return [];
    }
    if (nInsidePointCount == 3) {
        triangle.color = {r: 255, g: 255, b: 255};
        return [triangle];
    }
    if (nInsidePointCount == 1 && nOutsidePointCount == 2) {
        let out_tri1 = new Triangle();
        out_tri1.point1 = inside_points[0];
        out_tri1.point2 = Vec3interSectionPlane(plane_p, plane_n, inside_points[0], outside_points[0]);
        out_tri1.point3 = Vec3interSectionPlane(plane_p, plane_n, inside_points[0], outside_points[1]);
        return [out_tri1];
    }
    if (nInsidePointCount == 2 && nOutsidePointCount == 1) {
        let out_tri1 = new Triangle();
        out_tri1.point1 = inside_points[0];
        out_tri1.point2 = inside_points[1];
        out_tri1.point3 = Vec3interSectionPlane(plane_p, plane_n, inside_points[0], outside_points[0]);

        let out_tri2 = new Triangle();
        out_tri2.point1 = inside_points[1];
        out_tri2.point2 = out_tri1.point3;
        out_tri2.point3 = Vec3interSectionPlane(plane_p, plane_n, inside_points[1], outside_points[0]);
        return [out_tri1, out_tri2];
    }
}
function MatrixMultiplyVector(matrix, vector) {
    let res = new Vec3();
    res.x = vector.x * matrix[0][0] + vector.y * matrix[1][0] + vector.z * matrix[2][0] + matrix[3][0];
    res.y = vector.x * matrix[0][1] + vector.y * matrix[1][1] + vector.z * matrix[2][1] + matrix[3][1];
    res.z = vector.x * matrix[0][2] + vector.y * matrix[1][2] + vector.z * matrix[2][2] + matrix[3][2];
    res.w = vector.x * matrix[0][3] + vector.y * matrix[1][3] + vector.z * matrix[2][3] + matrix[3][3];
    return res;
}
function multiplyMatrixVector(matrix, vector) {
    let res = new Vec3();
    res.x = vector.x * matrix[0][0] + vector.y * matrix[1][0] + vector.z * matrix[2][0] + matrix[3][0];
    res.y = vector.x * matrix[0][1] + vector.y * matrix[1][1] + vector.z * matrix[2][1] + matrix[3][1];
    res.z = vector.x * matrix[0][2] + vector.y * matrix[1][2] + vector.z * matrix[2][2] + matrix[3][2];
    let w = vector.x * matrix[0][3] + vector.y * matrix[1][3] + vector.z * matrix[2][3] + matrix[3][3];
    if (w != 0) {
        res.x /= w;
        res.y /= w;
        res.z /= w;
    }
    return res;
}


class Camera {
    constructor() {
        this.position = new Vec3(10, 20, 0);
        this.yaw = 0;
        this.pitch = 0;

        this.near = 0.1;
        this.far =1000;
        this.fov = 60;
        this.aspectRatio = canvas.width / canvas.height;
        this.fovRad = 1 / Math.tan(this.fov * 0.5 / 180 * Math.PI);
        this.projectionMatrix = MatrixMakeProjection(this.fov, this.aspectRatio, this.near, this.far);

        let vUp = new Vec3(0, -1, 0);
        let Target = new Vec3(0, 0, 1);
        
        let camrot = MatrixMakeIdentity();
        let rotY = MatrixMakeRotationY(this.yaw);
        let rotX = MatrixMakeRotationX(this.pitch);
        camrot = MatricesMultiplication(rotX, rotY);

        let lookDir = MatrixMultiplyVector(camrot, Target);
        this.vTarget = Vec3add(this.position, lookDir);

        let matCamera = MatrixPointat(this.position, this.vTarget, vUp);
        this.vForward = Vec3sub(this.vTarget, this.position);
        this.matView = Matrix_QuickInverse(matCamera);
    }

    updateViewMatrix() {
        let vUp = new Vec3(0, -1, 0);
        let Target = new Vec3(0, 0, 2);
        let camrot = MatrixMakeIdentity();
        let rotY = MatrixMakeRotationY(this.yaw);
        let rotX = MatrixMakeRotationX(this.pitch);
        camrot = MatricesMultiplication(rotX, rotY);
        
        let lookDir = MatrixMultiplyVector(camrot, Target);
        this.vTarget = Vec3add(this.position, lookDir);
        let matCamera = MatrixPointat(this.position, this.vTarget, vUp);
        this.vForward = Vec3sub(this.vTarget, this.position);
        this.matView = Matrix_QuickInverse(matCamera);
    }
}

class World3D {
    constructor() {
        this.camera = new Camera();
        this.timeElapsed = 0

        // hide cursor over canvas
        canvas.addEventListener("mouseenter", (e) => {
            canvas.style.cursor = "none";
        });
        canvas.addEventListener("mouseleave", (e) => {
            canvas.style.cursor = "default";
        });

        // event listeners
        // mouse
        document.addEventListener("mousemove", (e) => {
            const sensitivity = 0.05;
            // Adjust yaw and pitch with sensitivity and delta time
            this.camera.yaw += e.movementX * sensitivity;
            this.camera.pitch += e.movementY * sensitivity;
            
            //clamp pitch to avoid flipping over
            if (this.camera.pitch > 1.5) this.camera.pitch = 1.5;
            if (this.camera.pitch < -1.5) this.camera.pitch = -1.5;
            this.camera.updateViewMatrix();
        });
        document.addEventListener("keydown", (e) => {
            let movementvector = new Vec3(0, 0, 0);
            if(e.key == "a"){
                let vSideways = CrossProduct(this.camera.vForward, new Vec3(0, -1, 0));
                //update movement vector
                movementvector = Vec3add(movementvector, vSideways);
            }
            if(e.key == "d"){
                //sideways is cross product of forward and up
                let vSideways = CrossProduct(this.camera.vForward, new Vec3(0, -1, 0));
                //invert sideways 
                vSideways = Vec3mul(vSideways, -1);
                // this.camera.position = Vec3add(this.camera.position, vSideways);
                movementvector = Vec3add(movementvector, vSideways);
            }
            if(e.key == "w"){
                // this.camera.position = Vec3add(this.camera.position, this.camera.vForward);
                movementvector = Vec3add(movementvector, this.camera.vForward);
            }
            if(e.key == "s"){
                movementvector = Vec3sub(movementvector, this.camera.vForward);
                // this.camera.position = Vec3sub(this.camera.position, this.camera.vForward);
            }
            this.camera.position = Vec3add(this.camera.position, movementvector);
            this.camera.updateViewMatrix();
        });
        this.draw();
    }
    transformPoint3DTo2D(point3D) {
        let point2D = multiplyMatrixVector(this.camera.projectionMatrix, point3D);
        point2D.x += 1;
        point2D.y += 1;
        point2D.x *= 0.5 * canvas.width 
        point2D.y *= 0.5 * canvas.height 
        return point2D;
    }
    finalDraw(trianglesToDraw){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //draw black background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
        //sort triangles to draw (Painters algorithm)
        trianglesToDraw.sort((a, b) => {
            let z1 = (a.triangleProj.point1.z + a.triangleProj.point2.z + a.triangleProj.point3.z) / 3;
            let z2 = (b.triangleProj.point1.z + b.triangleProj.point2.z + b.triangleProj.point3.z) / 3;
            return z2 - z1;
        });
        
        let que = [...trianglesToDraw];
        //foreach plane
        for (let j = 0; j < 4; j++) {
            //loop through all triangles and check if they collide with plane
            let newTlen = que.length;
            while ( newTlen > 0 ) {
                let testtriangle = que[0].triangleProj;
                let dp = que[0].dp;
                //remove q[0] from que
                que.shift();
                newTlen--;
                let newTriangles = [];
                switch(j){
                    case 0: newTriangles = TriangleClipAgainstPlane(new Vec3(0, 0, 0), new Vec3(0, 1, 0), testtriangle); break;
                    case 1: newTriangles = TriangleClipAgainstPlane(new Vec3(0, canvas.height - 1, 0), new Vec3(0, -1, 0), testtriangle); break;
                    case 2: newTriangles = TriangleClipAgainstPlane(new Vec3(0, 0, 0), new Vec3(1, 0, 0), testtriangle); break;
                    case 3: newTriangles = TriangleClipAgainstPlane(new Vec3(canvas.width - 1, 0, 0), new Vec3(-1, 0, 0), testtriangle); break;
                }
                //add new triangles to que
                newTriangles.forEach((triangle) => {
                    que.push({triangleProj: triangle, dp: dp});
                });
            }
        }
        for (let i = 0; i < que.length; i++) {
            let triangleProj = que[i].triangleProj;
            let dp = que[i].dp;
            drawTriangle(triangleProj, dp);
        }
        this.timeElapsed += 1;
    }
    draw() {
        requestAnimationFrame(this.draw.bind(this));

        let trianglesToDraw = [];
        for (let i = 0; i < Cube.triangles.length; i++) {
            let timeloop = performance.now() / 1000 / 6 * 2 * Math.PI;
            //uncomment to go spinny spinny
            timeloop = 0;
            //set triangle back in space 
            let triangle = new Triangle(
                new Vec3(Cube.triangles[i].point1.x, Cube.triangles[i].point1.y, Cube.triangles[i].point1.z),
                new Vec3(Cube.triangles[i].point2.x, Cube.triangles[i].point2.y, Cube.triangles[i].point2.z),
                new Vec3(Cube.triangles[i].point3.x, Cube.triangles[i].point3.y, Cube.triangles[i].point3.z),
                Cube.triangles[i].color
            );

            let matRotZ = MatrixMakeRotationZ(timeloop);
            let matRotX = MatrixMakeRotationX(timeloop);

            //create rotation matrix
            let matTrans = MatrixMakeTranslation(0, 0, 16);

            let matWorld = matTrans;
            matWorld = MatricesMultiplication(matRotZ, matRotX);
            matWorld = MatricesMultiplication(matWorld, matTrans);


            triangle.point1 = MatrixMultiplyVector(matWorld, triangle.point1);
            triangle.point2 = MatrixMultiplyVector(matWorld, triangle.point2);
            triangle.point3 = MatrixMultiplyVector(matWorld, triangle.point3);
            const triTranslated = triangle;

            //undisplay backfaces
            let line1 = new Vec3(
                triTranslated.point2.x - triTranslated.point1.x,
                triTranslated.point2.y - triTranslated.point1.y,
                triTranslated.point2.z - triTranslated.point1.z
            );
            let line2 = new Vec3(
                triTranslated.point3.x - triTranslated.point1.x,
                triTranslated.point3.y - triTranslated.point1.y,
                triTranslated.point3.z - triTranslated.point1.z
            );
            let normal = CrossProduct(line1, line2);
            normal = Vec3normalize(normal);


            let cameraRay = Vec3sub(triTranslated.point1, this.camera.position);
            
            if (Vec3dot(normal, cameraRay) < 0) {
                let light_direction = new Vec3(0, 0, -1);


                //rotate light direction
                // let lightrotz = MatrixMakeRotationX(performance.now() / 4000 / 6 * 2 * Math.PI);
                // let lightrotx = MatrixMakeRotationZ(performance.now() / 4000 / 6 * 2 * Math.PI);
                // light_direction = MatrixMultiplyVector(lightrotz, light_direction);
                // light_direction = MatrixMultiplyVector(lightrotx, light_direction);

                light_direction = Vec3normalize(light_direction);
                let dp = normal.x * light_direction.x + normal.y * light_direction.y + normal.z * light_direction.z;
                let triangleProj = triTranslated;

                //transform triangle to world space 
                triangleProj.point1 = MatrixMultiplyVector(this.camera.matView, triangleProj.point1);
                triangleProj.point2 = MatrixMultiplyVector(this.camera.matView, triangleProj.point2);
                triangleProj.point3 = MatrixMultiplyVector(this.camera.matView, triangleProj.point3);

                //clip triangles against near plane
                let clipped = TriangleClipAgainstPlane(new Vec3(0, 0, this.camera.near), new Vec3(0, 0, 1), triangleProj);
                clipped.forEach((triangle) => {
                    //project triangle to 2D
                    triangle.point1 = this.transformPoint3DTo2D(triangle.point1);
                    triangle.point2 = this.transformPoint3DTo2D(triangle.point2);
                    triangle.point3 = this.transformPoint3DTo2D(triangle.point3);
                    //add all trinangles to array
                    trianglesToDraw.push({triangleProj: triangle, dp: dp});
                });
            }
        }
        this.finalDraw(trianglesToDraw);
    }
}



class Game{
    constructor(){
        //world is undefined until space is pressed
        this.world
        this.drawmenu();
        //event listeners
        document.addEventListener("keydown", (e) => {
            if(e.key == " "){
                this.world = new World3D();
                //stop drawing menu
                cancelAnimationFrame(this.drawmenu.bind(this));
                this.togglecursor();
            }
            //if escape is pressed, stop drawing world and draw menu
            if(e.key == "Escape"){
                this.world = undefined;
                cancelAnimationFrame(this.world.draw.bind(this.world));
                this.togglecursor();
                this.drawmenu();
            }
        });
    }

    togglecursor(){
        if(canvas.style.cursor == "none"){
            canvas.style.cursor = "default";
            canvas.removeEventListener("mousemove", (e) => {
                let x = e.clientX - canvas.width / 2;
                let y = e.clientY - canvas.height / 2;
                window.moveBy(x, y);
            });
        }else{
            canvas.style.cursor = "none";
            canvas.addEventListener("mousemove", (e) => {
                let x = e.clientX - canvas.width / 2;
                let y = e.clientY - canvas.height / 2;
                window.moveBy(x, y);
            });
        }
    }

    drawmenu(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Press space to start", canvas.width / 2 - 150, canvas.height / 2);
        ctx.fillText("WASD to move", canvas.width / 2 - 150, canvas.height / 2 + 50);
        ctx.fillText("Mouse to look around", canvas.width / 2 - 150, canvas.height / 2 + 100);
        ctx.fillText("Press space to start", canvas.width / 2 - 150, canvas.height / 2 + 150);
        
        requestAnimationFrame(this.drawmenu.bind(this));
    }
}

let game = new World3D();
