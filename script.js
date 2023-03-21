var app = new PIXI.Application(1800, 1200, { antialias: true, transparent: true });
document.body.appendChild(app.view);

// const imgUrl = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/face.png";
const imgUrl = "old_map.jpg";

//let sprite = new PIXI.Sprite.fromImage(imgUrl);

const pointsX = 10;
const pointsY = 10;
const pointsRef = [];

let mesh;
let texture = new PIXI.Texture.fromImage(imgUrl);
if ( !texture.requiresUpdate ) { texture.update(); }

let mContainer = new PIXI.Container();
mContainer.x = 15;
mContainer.y = 15;

texture.on('update', function() {
  console.log('texture loaded');
  if ( mesh ) { stage.removeChild(mesh); }
  mesh = new PIXI.mesh.Plane(this, pointsX, pointsY);
  mesh.width = this.width;
  mesh.height = this.height;
  mContainer.addChild(mesh);
  app.stage.addChild(mContainer);
  
  for(var i = 0; i < mesh.vertices.length; i+=2) {
    let p = new PIXI.Graphics();
    p.beginFill(0xff0000);
    p.drawCircle(mesh.vertices[i], mesh.vertices[i+1], 10);
    p.endFill();
    p.interactive = true;
    p.vi = [i, i+1];
    addInteraction(p);
    pointsRef.push(p);
    mContainer.addChild(p);
  }
});


function addInteraction(point) {
  
  point.on("pointerdown", function(e) {
    point.dragging = true;
    point.data = e.data;
    point.sx = point.data.getLocalPosition(point).x;
    point.sy = point.data.getLocalPosition(point).y;
  })
  
  point.on("pointerup", function(e) {
    point.dragging = false;
    point.data = null;
  });

  point.on("pointerupoutside", function(e) {
    point.dragging = false;
    point.data = null;
  })

  point.on("pointermove", function(e) {
    var newPosition = {};
     if(point.dragging) {
       console.log(e.data.global.x, point.sx)
       point.x = e.data.global.x - point.sx - point.parent.x;
       point.y = e.data.global.y - point.sy - point.parent.y;
       mesh.vertices[point.vi[0]] = e.data.global.x - point.parent.x ;
       mesh.vertices[point.vi[1]] = e.data.global.y - point.parent.y ;
       // also, move mesh.vertices[pvi - 3 points]
       
       // this row
       let rows = pointsX;
       let cols = pointsY;
       let pInRow = (point.vi[0] / 2) % rows;
       let pInCol = Math.floor((point.vi[0] / 2) / (cols));
       
       console.log(pInCol, pInRow)
       
       // get previous of THIS ROW, but not first
       // let vIdx = point.vi[0];
       // while(pInRow > 1) {
       //   pInRow--;
       //   vIdx -= 2;
       //   mesh.vertices[vIdx] += (mesh.vertices[vIdx +2] - mesh.vertices[vIdx]) / 2;
       //   console.log(mesh.vertices[vIdx]);
       // }
       //mesh.vertices[point.vi[0]-2] += (mesh.vertices[point.vi[0]] - mesh.vertices[point.vi[0]-2]) / 2;
     }
  })
}