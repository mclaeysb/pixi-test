// Define starting values for gcps
var gcps_old = [
  [100,100],
  [100,300],
  [500,100],
  [500,300],
  [300,200]
]
var gcps_new = [
  [100,100],
  [100,300],
  [500,100],
  [500,300],
  [300,200]
]

// Create pixi-js application
var app = new PIXI.Application(1800, 1200, { antialias: true, transparent: true });
document.body.appendChild(app.view);

// Create texture
const imgUrl = "old_map_small.png";
let texture = new PIXI.Texture.fromImage(imgUrl);
// let sprite = new PIXI.Sprite.fromImage(imgUrl);
if ( !texture.requiresUpdate ) { texture.update(); }

// Create container
let mContainer = new PIXI.Container();
mContainer.x = 15;
mContainer.y = 15;

// Create mesh
const pointsX = 20;
const pointsY = 20;
// const pointsRef = [];
let mesh;

texture.on('update', function() {
  console.log('texture loaded');
  if ( mesh ) { stage.removeChild(mesh)} // TODO: remove?
  mesh = new PIXI.mesh.Plane(this, pointsX, pointsY);
  mesh.width = this.width;
  mesh.height = this.height;
  mContainer.addChild(mesh);
  app.stage.addChild(mContainer);
  
  // gcps_old
  for(var i = 0; i < gcps_old.flat().length; i+=2) {
    let p = new PIXI.Graphics();
    p.beginFill(0x00ff00);
    p.drawCircle(gcps_old.flat()[i], gcps_old.flat()[i+1], 10);
    p.endFill();
    p.interactive = true;
    p.vi = [i, i+1];
    addInteractionGcps(p, gcps_old);
    // pointsRef.push(p);
    mContainer.addChild(p);
  }

  // gcps_new
  for(var i = 0; i < gcps_new.flat().length; i+=2) {
    let p = new PIXI.Graphics();
    p.beginFill(0x0000ff);
    p.drawCircle(gcps_new.flat()[i], gcps_new.flat()[i+1], 10);
    p.endFill();
    p.interactive = true;
    p.interactive = true;
    p.vi = [i, i+1];
    addInteractionGcps(p, gcps_new);
    // pointsRef.push(p);
    mContainer.addChild(p);
  }

  // mps
  for(var i = 0; i < mesh.vertices.length; i+=2) {
    let p = new PIXI.Graphics();
    p.beginFill(0xff0000);
    p.drawCircle(mesh.vertices[i], mesh.vertices[i+1], 5);
    p.endFill();
    // p.interactive = true;
    p.vi = [i, i+1];
    // addInteractionMps(p);
    // pointsRef.push(p);
    mContainer.addChild(p);
  }
});

function addInteractionGcps(point, gcps) {
  
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
        // e.data.global.x is the points current position
        // point.sx is the points original position (+ where you click)
        // point.parent.x takes care of mContainer dimensions 
        // console.log(e.data.global.x, point.sx, point.parent.x)
        // console.log(e.data.global.y, point.sy, point.parent.y)
        point.x = e.data.global.x - point.sx - point.parent.x;
        point.y = e.data.global.y - point.sy - point.parent.y;
        gcps[point.vi[0]/2] = [
          e.data.global.x - point.parent.x, 
          e.data.global.y - point.parent.y
        ]
        // To know which point you clicked
       console.log("moving point", point.vi[0]/2)
     }
  })
}

function addInteractionMps(point) {
  
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
      // e.data.global.x is the points current position
      // point.sx is the points original position (+ where you click)
      // point.parent.x takes care of mContainer dimensions 
       // console.log(e.data.global.x, point.sx, point.parent.x)
       // console.log(e.data.global.y, point.sy, point.parent.y)
       point.x = e.data.global.x - point.sx - point.parent.x;
       point.y = e.data.global.y - point.sy - point.parent.y;
       mesh.vertices[point.vi[0]] = e.data.global.x - point.parent.x ;
       mesh.vertices[point.vi[1]] = e.data.global.y - point.parent.y ;
       // also, move mesh.vertices[pvi - 3 points]
       
       // To know which point you clicked
       let rows = pointsX;
       let cols = pointsY;
       let pInRow = (point.vi[0] / 2) % rows;
       let pInCol = Math.floor((point.vi[0] / 2) / (cols));
       console.log("moving mps", pInCol, pInRow)
     }
  })
}

document.getElementById("georeference").onclick = function(){
  updateTps()
};

function updateTps() {
  // Prepare gcps for creation of ThinPlateSpline
  var gcps_old_new = []
  for(var i = 0; i < gcps_old.length; i++) {
    gcps_old_new.push([gcps_old[i],gcps_new[i]])
  }
  // Initialise ThinPlateSpline
  var tps = new ThinPlateSpline();
  // Solve ThinPlateSpline
  tps.push_points(gcps_old_new);
  tps.solve();
  
  // Prepare mps for evaluation by ThinPlateSpline
  var mps_old = []
  for(var i = 0; i < mesh.vertices.length; i+=2) {
    mps_old.push([mesh.vertices[i],mesh.vertices[i+1]])
  }
  // Evaluate mps in ThinPlateSpline
  const mps_new = mps_old.map(mp_old => {
      return tps.transform(mp_old, false);
  })
  // Apply mps
  for(var i = 0; i < mesh.vertices.length; i+=2) {
    mesh.vertices[i] = mps_new[i/2][0]
    mesh.vertices[i+1] = mps_new[i/2][1]
  }
}