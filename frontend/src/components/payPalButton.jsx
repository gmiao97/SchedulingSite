import React, { useState, useRef, useEffect } from 'react';

export default function PayPalButton(props) {

  const [error, setError] = useState(null);
  const paypalRef = useRef();

  useEffect(() => {
    window.paypal
      .Buttons({
        style: {
          shape:  'pill',
          height: 40
        },
        createSubscription: (data, actions) => {
          return actions.subscription.create({
            'plan_id': 'P-16G699664V806364PL4GJRSQ' // Creates the subscription
          });
        },
        onApprove: async (data, actions) => {
          alert('You have successfully created subscription ' + data.subscriptionID);
          // const order = await actions.order.capture();
          // setPaidFor(true);
          // console.log(order);
        },
        // onError: err => {
        //   setError(err);
        //   console.error(err);
        // },
      })
      .render(paypalRef.current);
  }, []);

  // if (paidFor) {
  //   return (
  //     <div>
  //       <h1>Congrats, you just bought {props.product.name}!</h1>
  //     </div>
  //   );
  // }

  return (
    // <div>
    //   {error && <div>Uh oh, an error occurred! {error.message}</div>}
    //   <h1>
    //     {props.product.description} for ${props.product.price}
    //   </h1>
    //   <img alt={props.product.description} src={props.product.image} width="200" />
      <div ref={paypalRef} />
    // </div>
  );
}

