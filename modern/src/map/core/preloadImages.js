import { grey } from '@mui/material/colors';
import createPalette from '@mui/material/styles/createPalette';
import { loadImage, prepareIcon } from './mapUtil';

import arrowSvg from '../../resources/images/arrow.svg';
import directionSvg from '../../resources/images/direction.svg';
import backgroundSvg from '../../resources/images/background.svg';
import animalSvg from '../../resources/images/icon/animal.svg';
import bicycleSvg from '../../resources/images/icon/bicycle.svg';
import boatSvg from '../../resources/images/icon/boat.svg';
import busSvg from '../../resources/images/icon/bus.svg';
import carSvg from '../../resources/images/icon/car.svg';
import camperSvg from '../../resources/images/icon/camper.svg';
import craneSvg from '../../resources/images/icon/crane.svg';
import defaultSvg from '../../resources/images/icon/default.svg';
import helicopterSvg from '../../resources/images/icon/helicopter.svg';
import motorcycleSvg from '../../resources/images/icon/motorcycle.svg';
import offroadSvg from '../../resources/images/icon/offroad.svg';
import personSvg from '../../resources/images/icon/person.svg';
import pickupSvg from '../../resources/images/icon/pickup.svg';
import planeSvg from '../../resources/images/icon/plane.svg';
import scooterSvg from '../../resources/images/icon/scooter.svg';
import shipSvg from '../../resources/images/icon/ship.svg';
import tractorSvg from '../../resources/images/icon/tractor.svg';
import trainSvg from '../../resources/images/icon/train.svg';
import tramSvg from '../../resources/images/icon/tram.svg';
import trolleybusSvg from '../../resources/images/icon/trolleybus.svg';
import truckSvg from '../../resources/images/icon/truck.svg';
import vanSvg from '../../resources/images/icon/van.svg';
import excavatorSvg from '../../resources/images/icon/excavator.svg';
import truckcraneSvg from '../../resources/images/icon/truckcrane.svg';
import graderSvg from '../../resources/images/icon/grader.svg';
import bulldozerSvg from '../../resources/images/icon/bulldozer.svg';
import boringmachineSvg from '../../resources/images/icon/boringmachine.svg';
import rollermachineSvg from '../../resources/images/icon/rollermachine.svg';
import paverSvg from '../../resources/images/icon/paver.svg';
import drumtruckSvg from '../../resources/images/icon/drumtruck.svg';
import trailertruckSvg from '../../resources/images/icon/trailertruck.svg';
import concretetruckSvg from '../../resources/images/icon/concretetruck.svg';
import roadrollerSvg from '../../resources/images/icon/roadroller.svg';
import forkliftSvg from '../../resources/images/icon/forklift.svg';
import forklift2Svg from '../../resources/images/icon/forklift2.svg';
import excavator2Svg from '../../resources/images/icon/excavator2.svg';
import asphaltroadSvg from '../../resources/images/icon/asphaltroad.svg';
import crawlercraneSvg from '../../resources/images/icon/crawlercrane.svg';
import loaderSvg from '../../resources/images/icon/loader.svg';
import forklift3Svg from '../../resources/images/icon/forklift3.svg';
import telescoplifterSvg from '../../resources/images/icon/telescoplifter.svg';
import backfillcompactorSvg from '../../resources/images/icon/backfillcompactor.svg';

export const mapIcons = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  camper: camperSvg,
  crane: craneSvg,
  default: defaultSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  offroad: offroadSvg,
  person: personSvg,
  pickup: pickupSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  ship: shipSvg,
  tractor: tractorSvg,
  train: trainSvg,
  tram: tramSvg,
  trolleybus: trolleybusSvg,
  truck: truckSvg,
  van: vanSvg,
  excavator: excavatorSvg,
  truckcrane: truckcraneSvg,
  grader: graderSvg,
  bulldozer: bulldozerSvg,
  boringmachine: boringmachineSvg,
  rollermachine: rollermachineSvg,
  paver: paverSvg,
  drumtruck: drumtruckSvg,
  trailertruck: trailertruckSvg,
  concretetruck: concretetruckSvg,
  roadroller: roadrollerSvg,
  forklift: forkliftSvg,
  forklift2: forklift2Svg,
  excavator2: excavator2Svg,
  asphaltroad: asphaltroadSvg,
  crawlercrane: crawlercraneSvg,
  loader: loaderSvg,
  forklift3: forklift3Svg,
  telescoplifter: telescoplifterSvg,
  backfillcompactor: backfillcompactorSvg,
};

export const mapIconKey = (category) => (mapIcons.hasOwnProperty(category) ? category : 'default');

export const mapImages = {};

const mapPalette = createPalette({
  neutral: { main: grey[500] },
});

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  mapImages.arrow = await prepareIcon(await loadImage(arrowSvg));
  await Promise.all(Object.keys(mapIcons).map(async (category) => {
    const results = [];
    ['info', 'success', 'error', 'neutral'].forEach((color) => {
      results.push(loadImage(mapIcons[category]).then((icon) => {
        mapImages[`${category}-${color}`] = prepareIcon(background, icon, mapPalette[color].main);
      }));
    });
    await Promise.all(results);
  }));
};
