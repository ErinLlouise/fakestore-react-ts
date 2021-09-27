import { useState } from "react";
import { useQuery } from "react-query";
import { Drawer, LinearProgress } from "@material-ui/core";
import Grid from '@material-ui/core/Grid'
import { AddShoppingCart } from "@material-ui/icons";
import Badge from '@material-ui/core/Badge'

import Item from './Item/Item'
import { Wrapper, StyledButton } from "./App.styles";
import Cart from './cart/Cart'

// correct type for get products function
export type CartItemType = {
  id: number
  catergory: string
  description: string
  image: string
  price: number
  title: string
  amount: number
}



// getproducts function with Promise passed in as were using async
// our CartItemType is passed into this and specified as an array
const getProducts = async (): Promise<CartItemType[]> => 
// await 1 is converting to JSON await 2 is waiting for API response itself
  await (await fetch('https://fakestoreapi.com/products')).json()



const App = (): any => {

  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([] as CartItemType[])
  // using react-query to fetch our data where we use the useQuery hook
  // we can also put in the return type of the data and specify an array structure
  // then we have the query key which is a string passed into our hook
  // and then we provide it with a function
  const { data, isLoading, error } = useQuery<CartItemType[]>(
    'products', 
    getProducts
  )
  console.log(data);


  // iterates through all items in the cart
  // it will use the object property amount value and add them up for our cart total
  const getTotalItems = (items: CartItemType[]) => 
    items.reduce((ack: number, item) => item.amount, 0)


  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems(prev => {
      // 1. is the item already in cart?
      const isItemInCart = prev.find(item => item.id === clickedItem.id)

      if (isItemInCart) {
        return prev.map(item => 
          item.id === clickedItem.id
          ? { ...item, amount: item.amount + 1 }
          : item
        )
      }
      // first time the item is added then we return an array with all the previous items in cart plus what has just been added
      return [...prev, {...clickedItem, amount: 1}]
    })
  }

  // if we are on the item that we clicked on we check if the amount is one
  // if it is we remove it from our cart array
  // if not, we remove just one so quantity of item is prev array -1
  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => (
      prev.reduce((ack, item) => {
        if (item.id === id) {
          if (item.amount === 1) return ack
          return [...ack, { ...item, amount: item.amount -1}]
        } else {
          return [...ack, item]
        }
      }, [] as CartItemType[])
    ))
  }

  if (isLoading) return <LinearProgress />
  if (error) return alert("Something went wrong...")
  
  return (
    <Wrapper>
      <Drawer anchor='right' open={cartOpen} onClose={() => setCartOpen(false)} >
        <Cart cartItems={cartItems} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart}/>
      </Drawer>
        <StyledButton onClick={() => setCartOpen(true)}>
          <Badge badgeContent={getTotalItems(cartItems)} color='error'>
            <AddShoppingCart />
          </Badge>
        </StyledButton>
      <Grid container spacing={3}>
        {data?.map(item => (
          <Grid item key={item.id} xs={12} sm={4}>
            <Item item={item} handleAddToCart={handleAddToCart}/>
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
}

export default App;
