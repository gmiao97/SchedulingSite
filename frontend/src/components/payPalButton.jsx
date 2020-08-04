import React, { useState, useRef, useEffect } from 'react';

export default function PayPalButton(props) {
  const [paidFor, setPaidFor] = useState(false);
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
  });

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



// import React, { Component } from "react";
// import ReactDOM from "react-dom";
// import scriptLoader from "react-async-script-loader";
// import paypal from "paypal-checkout";

// const CLIENT = {
//   sandbox: "AV6GwFKyXnkD-4Z6w0-vn_D_JpYABLxBHG3kXC4QLfuGqKx84AWd6h6fvdBNoD7HrngvOCmCYjJwS_p1",
//   production: "AV6GwFKyXnkD-4Z6w0-vn_D_JpYABLxBHG3kXC4QLfuGqKx84AWd6h6fvdBNoD7HrngvOCmCYjJwS_p1",
// };

// const CLIENT_ID = process.env.NODE_ENV === "production" ? CLIENT.production : CLIENT.sandbox;

// let paypalButton = null;

// class PayPalButton extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       showButtons: false,
//     };

//     this.paypalRef = React.createRef();

//     // window.React = React;
//     // window.ReactDOM = ReactDOM;
//   }

//   // componentDidMount() {
//   //   const { isScriptLoaded, isScriptLoadSucceed } = this.props;
    
//   //   if (isScriptLoaded && isScriptLoadSucceed) {
//   //     paypalButton = window.paypal.Buttons.driver("react", { React, ReactDOM });
//   //     this.setState({
//   //       // loading: false, 
//   //       showButtons: true,
//   //     });
//   //   }
//   // }

//     componentDidMount() {
//       window.paypal.Buttons({
//         createOrder: (data, actions) => {
//           return actions.order.create({
//             purchase_units: [
//               {
//                 description: "test",
//                 amount: {
//                   currency_code: 'USD',
//                   value: "10",
//                 },
//               },
//             ],
//           });
//         },
//         onApprove: async (data, actions) => {
//           actions.order.capture().then(details => {
//             const paymentData = {
//               payerID: data.payerID,
//               orderID: data.orderID
//             };
//             console.log("Payment Approved: ", paymentData);
//             // this.setState({ showButtons: false, paid: true });
//           });
//         },
//         onError: err => {
//           // setError(err);
//           console.error(err);
//         },
//       })
//       .render(this.paypalRef.current);
//     }

//   componentDidUpdate(prevProps) {
//     const { isScriptLoaded, isScriptLoadSucceed } = this.props;

//     if (prevProps.isScriptLoaded !== isScriptLoaded || prevProps.isScriptLoadSucceed !== isScriptLoadSucceed) {
//       const scriptJustLoaded = !this.state.showButtons && !prevProps.isScriptLoaded && isScriptLoaded;

//       if (scriptJustLoaded) {
//         if (isScriptLoadSucceed) {
//           paypalButton = window.paypal.Buttons.driver("react", { React, ReactDOM });
//           this.setState({
//             // loading: false, 
//             showButtons: true,
//           });
//         }
//       }
//     }
//   }

//   createOrder = (data, actions) => {
//     return actions.order.create({
//       purchase_units: [
//         {
//           description: +"Basic Subscription",
//           amount: {
//             currency_code: "USD",
//             value: 10
//           }
//         }
//       ]
//     });
//   }

//   onApprove = (data, actions) => {
//     actions.order.capture().then(details => {
//       const paymentData = {
//         payerID: data.payerID,
//         orderID: data.orderID
//       };
//       console.log("Payment Approved: ", paymentData);
//       // this.setState({ showButtons: false, paid: true });
//     });
//   }

//   render() {
//     return(
//       this.state.showButtons && <div ref={this.paypalRef} />
//       // <div >
//       //   {this.state.showButtons && 
//       //     <paypal.Button.react
//       //       createOrder={(data, actions) => this.createOrder(data, actions)}
//       //       onApprove={(data, actions) => this.onApprove(data, actions)}
//       //     />
//       //   }
//       // </div>
//     );
//   }
// }

// // export default scriptLoader(`https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}`)(PayPalButton);
// export default PayPalButton;