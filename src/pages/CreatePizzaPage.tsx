import React, { useState, useEffect } from 'react';

import ActionButton from '../components/ActionButton';
import PageHeading from '../components/PageHeading';
import PizzaCrustOption from '../components/PizzaCrustOption';
import PizzaIngredientOption from '../components/PizzaIngredientOption';
import PizzaSizeOption from '../components/PizzaSizeOption';
import { PizzaSize, PizzaCrust, PizzaIngredient, Pizza } from '../models/pizza';
import styled from '../styled';

const StepSection = styled.section`
  margin: 0 auto;
  text-align: center;
  padding: 1rem 0.25rem;
`;

const StepSubheading = styled(PageHeading)`
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.gunmetal}dd;
`;

const StepBody = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: row;
  }
`;

const CheckoutButton = styled(ActionButton)`
  width: 100%;
  padding: 1rem 0;
  margin: 0;
`;

const CreatePizzaPage: React.FC<{
  pizza: Pizza;
  pizzaSizes: Record<PizzaSize['id'], PizzaSize>;
  pizzaCrusts: Record<PizzaCrust['id'], PizzaCrust>;
  ingredients: Record<PizzaIngredient['id'], PizzaIngredient>;
  maxFreeToppings: number;
  pricePerTopping: number;
  onCheckout: (pizza: Pizza) => void;
}> = ({
  pizza,
  pizzaSizes,
  pizzaCrusts,
  ingredients,
  maxFreeToppings,
  pricePerTopping,
  onCheckout,
}) => {
  const [selectedPizzaSize, setSelectedPizzaSize] = useState(pizza.size as PizzaSize['id']);
  const [selectedPizzaCrust, setSelectedPizzaCrust] = useState(pizza.crust as PizzaCrust['id']);
  const [selectedToppings, setSelectedToppings] = useState(
    pizza.toppings || ([] as PizzaIngredient['id'][]),
  );

  const maxPrice = Math.max(...Object.values(pizzaSizes).map((size) => size.price));

  const ingredientIds = Object.keys(ingredients);
  // Divide ingredients into 2 rows for presentation
  const ingredientGroupIds = [
    ingredientIds.slice(0, ingredientIds.length / 2),
    ingredientIds.slice(ingredientIds.length / 2),
  ];

  const addTopping = (ingredientId: PizzaIngredient['id']) => {
    setSelectedToppings([...selectedToppings, ingredientId]);
  };

  const removeTopping = (ingredientId: PizzaIngredient['id']) => {
    setSelectedToppings(selectedToppings.filter((id) => id !== ingredientId));
  };

  const toggleTopping = (ingredientId: PizzaIngredient['id']) => {
    if (selectedToppings.includes(ingredientId)) {
      removeTopping(ingredientId);
    } else {
      addTopping(ingredientId);
    }
  };

  const getIngredientPrice = (ingredientId: PizzaIngredient['id']) => {
    if (selectedToppings.length < maxFreeToppings) {
      return 0;
    }
    const index = selectedToppings.indexOf(ingredientId);
    if (index >= 0 && index < maxFreeToppings) {
      return 0;
    } else {
      return pricePerTopping;
    }
  };

  const isIngredientEnabled = (ingredientId: PizzaIngredient['id']) => {
    if (selectedToppings.length < pizzaSizes[selectedPizzaSize].maxToppings) {
      return true;
    } else {
      return selectedToppings.includes(ingredientId);
    }
  };

  useEffect(() => {
    if (selectedToppings.length > pizzaSizes[selectedPizzaSize]?.maxToppings) {
      // reset selected ingredients if new pizza size cannot fit all ingredients
      setSelectedToppings([]);
    }
  }, [selectedPizzaSize, pizzaSizes, selectedToppings]);

  return (
    <section>
      <StepSection key="select-size">
        <PageHeading>Select the size of your pizza</PageHeading>
        <StepBody>
          {Object.values(pizzaSizes).map((pizzaSize) => (
            <PizzaSizeOption
              key={pizzaSize.id}
              name={pizzaSize.name}
              price={pizzaSize.price}
              imageSize={`${(pizzaSize.price / maxPrice) * 100}%`}
              isSelected={selectedPizzaSize === pizzaSize.id}
              onClick={() => setSelectedPizzaSize(pizzaSize.id)}
            ></PizzaSizeOption>
          ))}
        </StepBody>
      </StepSection>

      {selectedPizzaSize && (
        <StepSection key="select-crust">
          <PageHeading>Which crust type do you prefer?</PageHeading>
          <StepBody>
            {Object.values(pizzaCrusts).map((pizzaCrust) => (
              <PizzaCrustOption
                key={pizzaCrust.id}
                name={pizzaCrust.name}
                price={pizzaCrust.price}
                imageUrl={pizzaCrust.imageUrl}
                isSelected={selectedPizzaCrust === pizzaCrust.id}
                onClick={() => setSelectedPizzaCrust(pizzaCrust.id)}
              ></PizzaCrustOption>
            ))}
          </StepBody>
        </StepSection>
      )}

      {selectedPizzaCrust && (
        <StepSection key="select-ingredients">
          <PageHeading>What ingredients do you want?</PageHeading>
          <StepSubheading>
            The first {maxFreeToppings} ingredients are free; beyond that costs $
            {pricePerTopping.toFixed(2)} each.
          </StepSubheading>
          <StepSubheading>
            You can select {pizzaSizes[selectedPizzaSize].maxToppings - selectedToppings.length}{' '}
            more ingredient
            {pizzaSizes[selectedPizzaSize].maxToppings - selectedToppings.length === 1 ? '' : 's'}.
          </StepSubheading>

          {ingredientGroupIds.map((ingredientIds, index) => (
            <StepBody key={index}>
              {ingredientIds
                .map((ingredientId) => ingredients[ingredientId])
                .map((ingredient) => (
                  <PizzaIngredientOption
                    key={ingredient.id}
                    name={ingredient.name}
                    price={getIngredientPrice(ingredient.id)}
                    imageUrl={ingredient.imageUrl}
                    isSelected={selectedToppings.includes(ingredient.id)}
                    isDisabled={!isIngredientEnabled(ingredient.id)}
                    onClick={() => {
                      toggleTopping(ingredient.id);
                    }}
                  ></PizzaIngredientOption>
                ))}
            </StepBody>
          ))}
        </StepSection>
      )}

      {selectedPizzaCrust && (
        <CheckoutButton
          onClick={() =>
            onCheckout({
              size: selectedPizzaSize,
              crust: selectedPizzaCrust,
              toppings: selectedToppings,
            })
          }
        >
          Proceed to Checkout
        </CheckoutButton>
      )}
    </section>
  );
};

export default CreatePizzaPage;
