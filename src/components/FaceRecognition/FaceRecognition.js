import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, box, boxList }) => {
	return (
		<div className='center ma'>
		<div className='absolute mt2'>
			<img id='inputImage' alt={''} src={imageUrl} width='500px' height='auto' />
		{ boxList.map((box, i) => {
				console.log(box, i);
				return <div className='bounding-box' key={i} style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol}}></div>
			})}
		</div>
		</div>
	);
}

export default FaceRecognition;