//@ts-ignore
import { require } from "@hyperoracle/zkgraph-lib";
import { Bytes, Event, BigInt, ByteArray } from "@hyperoracle/zkgraph-lib";


const W: i32[][] = [
        [-212,-114,95,39,-41,-82,20,-240,-198,38,-203,-5,-77,67,-19,70,-164,96,-76,-143,-188,97,11,-136,80,-140,77,-1,-116,99,77,103,-85,70,169,39,-165,-145,-155,-113,-99,-186,-142,112,128,156,-9,-195,-177,-125,-56,-81,111,-27,-203,-146,-146,-210,115,0,-25,90,-43,-147,72,122,42,22,-184,-23,-24,174,-143,-160,-10,-126,-210,91,41,-229,105,-173,87,152],
        [91,58,-103,-198,26,-11,-230,-101,81,-49,115,58,10,-116,-14,-215,-202,-60,-35,129,-62,-221,71,-136,-261,-57,88,-87,29,-65,-175,-172,95,70,-249,-1,-101,20,78,138,-212,100,-182,-96,-163,58,-80,-171,-13,-212,54,-15,50,79,121,-193,-151,30,46,73,119,125,-185,51,78,78,65,-123,50,113,33,-222,128,-12,-218,64,-190,-14,-187,63,14,-40,87,-214],
        [107,-172,-28,52,106,88,105,-36,75,-88,109,-210,52,16,-124,-25,-178,43,-77,-9,-86,42,-199,57,93,-219,-170,-7,28,-1,83,66,84,90,-227,-111,-200,-99,94,-34,119,-158,59,-97,37,-87,47,2,1,-73,81,-47,114,71,0,-77,-4,-164,-183,142,66,-109,-74,120,-90,-144,90,-48,68,-174,82,-34,-220,103,88,12,88,-224,8,-188,-239,64,-214,-31],
        [-166,-101,-74,19,56,60,88,-176,-92,79,-139,-231,-103,-34,100,128,18,-129,-108,12,-163,14,54,139,67,-158,-61,112,4,-213,-78,122,-105,95,-100,101,92,21,-189,-77,-216,-215,66,-222,-38,-128,34,24,105,10,2,57,56,90,53,111,45,31,-48,-144,-137,-159,91,42,67,-37,59,41,-80,-83,-39,145,107,-197,52,-149,5,111,-105,-43,78,-205,-134,-105],
        [48,-130,56,-231,67,-35,-96,-226,-174,-97,68,-65,36,-241,-173,-166,-148,102,105,137,-144,-201,144,-195,-159,-192,-46,-17,-196,33,61,76,-6,-7,-141,-27,-221,114,-204,-11,-133,157,-62,124,-194,79,-59,-41,-76,-168,-180,-65,79,-226,-245,-24,81,36,1,64,131,-11,128,-49,101,10,-21,141,75,42,68,105,-74,-16,100,30,-249,36,61,-56,-175,119,91,11],
        [-213,-107,41,43,76,46,127,-74,-197,33,37,-133,56,-132,-110,86,-21,-148,59,67,-232,-171,126,-224,40,25,131,62,95,0,42,-228,-16,-52,-144,74,-65,-188,-83,99,-183,155,56,115,85,-209,91,70,10,35,93,-20,-159,20,-219,102,-145,120,-195,-80,-193,102,134,-16,108,56,-31,-65,-157,-160,-72,-210,119,13,-45,-207,58,-32,-137,45,93,-218,5,-227],
        [78,-29,-83,44,-193,-6,48,109,24,-89,-121,128,-77,-171,-111,-21,20,-223,-65,-229,8,82,41,87,-227,84,6,-7,40,98,-155,-14,79,17,49,-244,64,-22,71,126,14,18,90,84,17,-29,65,29,20,-145,-215,-73,-134,-172,-80,62,19,14,-171,-220,-179,-110,99,-213,8,105,-27,-27,0,47,-21,-169,-62,78,-227,-35,95,-94,-170,129,102,68,128,-141],
        [69,127,-106,71,-84,-39,102,-28,66,66,-158,-19,87,36,91,134,49,-162,-33,-221,-240,-234,-217,136,-28,-170,151,-87,-130,-138,-182,86,-19,-54,143,-145,13,23,-165,-190,110,-135,1,-198,32,59,-53,-24,-167,38,-26,96,-8,-50,136,-206,119,14,-173,134,-192,-248,-212,-4,-215,-154,-105,120,-207,146,34,-200,10,-59,43,69,130,37,112,-154,70,66,-182,-158],
        [-72,146,-63,-170,-196,59,-216,110,-7,24,101,-19,3,133,-129,-34,-133,73,-103,67,46,123,-115,98,77,-254,53,46,-45,-146,-93,-97,-71,38,-194,79,74,66,129,-4,-165,-226,-226,-192,-165,-65,18,-175,107,-217,62,11,-157,90,-56,-108,86,-199,112,-2,-12,-49,-216,52,-128,-186,-34,24,-102,-183,79,102,-96,27,97,61,-24,-186,112,-229,-151,108,-88,-13],
        [76,-74,82,-35,-199,56,-105,-38,37,-54,-197,136,2,-211,32,134,111,37,72,-103,-220,-195,-10,25,-8,92,-78,-121,-125,130,146,-53,67,64,-44,-31,-75,135,-218,-188,60,-119,74,-43,46,-38,-45,-3,66,60,22,-1,-250,-194,128,-75,-215,40,-127,-188,-244,109,143,-245,21,137,-9,109,129,-28,-31,57,-202,-162,-94,20,111,-7,-102,89,-184,-241,-53,-79],
      ];

export function handleEvents(events: Event[]): Bytes {
  let address = new Bytes(20); 
  // let embedding = new BigInt(84); 
  let embedding = new Array<i32>(84); 
  // let output = new BigInt(10);
  let output = new Array<i32>(10);

  if (events.length > 0) {
    address = events[0].topic1;
    const source = changetype<Bytes>(events[0].data);
    // console.log(typeof events[0].data)

    // change it to an array of BigInt
    for(let i = 0; i < 84; i++) {
      embedding[i] = BigInt.fromBytesBigEndian(source.slice(i * 32, i * 64)).toI32();
    } 

    for(let i = 0; i < 10; i++) {
      output[i] = 0;
      for(let j = 0; j < 84; j++) {
        //output[i] = output[i].plus(embedding[j].times(BigInt.fromi32(W[i][j])));
        output[i] = output[i] + (embedding[j] * W[i][j]);
      }
    }
  }

  let max_: i32 = output[0];
  let argMax: i32 = 0;
  for(let i = 0; i < 10; i++) {
    if (output[i] > max_) {
      argMax = i;
      max_ = output[i];
    }
  }
  let funcSel:  Bytes = Bytes.fromHexString('0x37c0d286').padStart(4,0);
  let argMaxBytes = Bytes.fromI32(argMax).padStart(32,0);
  //let calldata = funcSel.concat(argMaxBytes).concat(address.padStart(32,0)).toHex();
  // let calldata = funcSel.concat(argMaxBytes).concat(address.padStart(32,0)).toHex();
  let calldata = funcSel.concat(argMaxBytes).concat(address.padStart(32,0));

  //require(state.length == 20);
  // return ByteArray.fromHexString(calldata);
  // return calldata;
  return Bytes.fromByteArray(calldata);
}