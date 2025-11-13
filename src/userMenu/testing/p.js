// ...existing code...

  // ────────────────────────────
  // Cart +/- with backend (improved)
  // ────────────────────────────
  const changeQty = async (item, nextQty) => {
    setMutating(true);

    // optimistic update
    setQuantities((prev) => {
      const c = { ...prev };
      if (nextQty <= 0) delete c[item.id];
      else c[item.id] = nextQty;
      return c;
    });

    try {
      const cur = quantities[item.id] || 0;

      // Case 1: First time adding (cur=0, next>0) -> use addToCart
      if (cur === 0 && nextQty > 0) {
        await addToCart({
          loc_id: item.loc_id,
          table_id: tableNo.table_id,
          item_id: item.id,
          quantity: nextQty,
          unit_price: item.price,
          variant_id: 1,
        });
      }
      // Case 2: Decrementing (next < cur) -> use removeFromCart
      else if (nextQty < cur) {
        await removeFromCart({
          loc_id: item.loc_id,
          table_id: tableNo.table_id,
          item_id: item.id,
        });
      }
      // Case 3: Incrementing (next > cur) -> use addToCart
      else if (nextQty > cur) {
        await addToCart({
          loc_id: item.loc_id,
          table_id: tableNo.table_id,
          item_id: item.id,
          quantity: 1,
          unit_price: item.price,
          variant_id: 1,
        });
      }

      await refreshCart();
    } catch (e) {
      console.error("changeQty error", e);
      await refreshCart(); // rollback
    } finally {
      setMutating(false);
    }
  };

  const increment = (id) => {
    const item = allItems.find((x) => Number(x.id) === Number(id));
    if (!item) return;
    const cur = quantities[id] || 0;
    changeQty(item, cur + 1);
  };

  const decrement = (id) => {
    const item = allItems.find((x) => Number(x.id) === Number(id));
    if (!item) return;
    const cur = quantities[id] || 0;
    if (cur > 1) {
      changeQty(item, cur - 1);
    } else if (cur === 1) {
      changeQty(item, 0); // triggers removeFromCart
    }
  };

  // ────────────────────────────
  // Clear entire cart
  // ────────────────────────────
  const handleClearCart = async () => {
    try {
      setMutating(true);
      
      // Case 3: Use clearCart API with loc_id + table_id only
      await clearCart({
        loc_id: serverCart[0]?.loc_id, // get from any item in cart
        table_id: tableNo.table_id,
      });

      // Reset local state
      setServerCart([]);
      setQuantities({});
      setItemNotes({});
      setOrderNote("");

      setsnackbarContent("Cart cleared");
      setSnackbarMode("success");
      setSuccessSnackbarOpen(true);
    } catch (e) {
      console.error("handleClearCart error", e);
      setsnackbarContent("Unable to clear cart");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    } finally {
      setMutating(false);
    }
  };

  // ...existing code...

  // Update the clearCart button call (in floating cart box)
  <IconButton
    onClick={handleClearCart}
    size="small"
    sx={{ bgcolor: "white", color: "black" }}
    disabled={mutating}
  >
    <CloseIcon />
  </IconButton>

// ...existing code...