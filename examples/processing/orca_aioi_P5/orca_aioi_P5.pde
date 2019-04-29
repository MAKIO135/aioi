import oscP5.*;

OscP5 oscP5;

int shape = 0;
float c = 255;

void setup() {
  size(400, 400);
  background(0);
  oscP5 = new OscP5(this, 12000);
  stroke(255, 0, 0);
  strokeCap(PROJECT);
  noFill();
}

void draw() {
  background(c, 0, 0);
  c = lerp(c, 0, 0.07);

  strokeWeight(0.8);
  for (int y = 10; y < height; y += 20) {
    for (int x = 10; x < width; x += 20) {
      point(x, y);
    }
  }

  strokeWeight(20);
  if (shape == 0) {
    // don't draw shape
  } else if (shape == 1) {
    rect(60, 60, width - 120, height - 120);
  } else if (shape == 2) {
    ellipse(width/2, height/2, width - 100, height - 100);
  } else if (shape == 3) {
    line(50, 50, width - 50, height - 50);
    line(50, height - 50, width - 50, 50);
  } else if (shape == 4) {
    triangle(width/2, 70, width - 50, height - 70, 50, height - 70);
  }
}

void oscEvent(OscMessage msg) {
  print("### received an osc message.");
  print(" addrpattern: " + msg.addrPattern());
  println(" typetag: " + msg.typetag());

  if (msg.checkAddrPattern("/shape") == true) {
    if (msg.checkTypetag("i") == true) {
      shape = msg.get(0).intValue();
      c = 255;
    }
  }
}
