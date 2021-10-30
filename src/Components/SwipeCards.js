import React, { useState, useMemo, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import StarRatings from 'react-star-ratings';

const addToCart = (selected) => {
  const appendString = selected.map((asin, index) => `ASIN.${index}=${asin}&Quantity.${index}=1`);
  const URL = "https://www.amazon.in/gp/aws/cart/add.html?AssociateTag=swipecart09-21"
  const url_parts = [URL, ...appendString];
  const url = url_parts.join("&");
  return url;
}


const SwipeCards = (props) => {
  const asins = Object.keys(props.grocery);
  const db = asins.map(x => {
    return {
      asin: x,
      name: props.grocery[x]['title'], 
      url: props.grocery[x]['image'],
      ratings: props.grocery[x]['reviews.rating'],
      savings: props.grocery[x]['price.savings_amount']
    }
  });

  const [currentIndex, setCurrentIndex] = useState(db.length - 1);
  const [lastDirection, setLastDirection] = useState();
  const [currentUrl, setCurrentUrl] = useState("");
  // used for outOfFrame closure  
  const currentIndexRef = useRef(currentIndex);
  const selectedASINs = useRef([]);

  const childRefs = useMemo(
    () =>
      Array(db.length)
        .fill(0)
        .map((i) => React.createRef()),
    [db.length]
  );

  const currentData = db[currentIndex];

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  }

  const canGoBack = currentIndex < db.length - 1;

  const canSwipe = currentIndex >= 0;

  // set last direction and decrease current index
  const swiped = (direction, asin, index) => {
    if (direction === 'right') {
      selectedASINs.current = [...selectedASINs.current, asin];
      const url1 = addToCart(selectedASINs.current);
      setCurrentUrl(url1);
    }
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  }

  const outOfFrame = (name, idx) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current)
    // handle the case in which go back is pressed before card goes outOfFrame
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard()
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  }

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < db.length) {
      await childRefs[currentIndex].current.swipe(dir) // Swipe the card!
    }
  }

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return
    const newIndex = currentIndex + 1
    updateCurrentIndex(newIndex)
    await childRefs[newIndex].current.restoreCard()
  }

  return (
    <div  className="main-div">
      <link
        href='https://fonts.googleapis.com/css?family=Damion&display=swap'
        rel='stylesheet'
      />
      <link
        href='https://fonts.googleapis.com/css?family=Alatsi&display=swap'
        rel='stylesheet'
      />
      <h1 className="heading" >Swipe Cart</h1>
      <div className="cardContents">
        <div className='cardContainer'>
          {db.map((character, index) => (
            <TinderCard
              ref={childRefs[index]}
              className='swipe'
              key={character.name}
              onSwipe={(dir) => swiped(dir, character.asin, index)}
              onCardLeftScreen={() => outOfFrame(character.name, index)}
              key={index}
            >
              <div
                style={{ backgroundImage: 'url(' + character.url + ')' }}
                className='card'
              >
              </div>
            </TinderCard>
          ))}
        </div>
        <div className="meta-content">
          <h3 className="long-text">{currentData.name} </h3>
          Savings: Rs. {currentData.savings} <br/>
          <StarRatings
            rating={currentData.ratings}
            starDimension="20px"
            starRatedColor='rgb(255,215,0)'
            starSpacing="2px"
          />

          <div className='buttons'>
            <button style={{ backgroundColor: !canSwipe && '#c3c4d3' }} onClick={() => swipe('left')}>Reject</button>
            <button style={{ backgroundColor: !canGoBack && '#c3c4d3' }} onClick={() => goBack()}>Undo swipe!</button>
            <button style={{ backgroundColor: !canSwipe && '#c3c4d3' }} onClick={() => swipe('right')}>Add to Cart</button>
          </div>
          <div className='buttons'>
            <button style={{ backgroundColor: !canSwipe && '#c3c4d3', width: '100%' }} onClick={() => window.open(currentUrl, "_blank")}>Add to Cart</button>
          </div>
        </div>
      </div>
          
      
      
      {lastDirection ? (
        <h2 key={lastDirection} className='infoText'>
          You swiped {lastDirection}
        </h2>
      ) : (
        <h2 className='infoText'>
          Swipe a card or press a button to get Restore Card button visible!
        </h2>
      )}
    </div>
  )
}

export default SwipeCards
