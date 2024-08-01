// frontend/pages/index.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from '../store';
import { setPrices, setSymbol, addPrice } from '../store';

const Home = () => {
    const dispatch = useDispatch();
    const { symbol, prices } = useSelector((state) => state);

    useEffect(() => {
        const fetchPrices = async () => {
            const response = await fetch(`http://localhost:5000/prices/${symbol}`);
            const data = await response.json();
            dispatch(setPrices(data));
        };

        fetchPrices();

        const ws = new WebSocket('ws://localhost:5000');
        ws.onmessage = (event) => {
            const priceData = JSON.parse(event.data);
            if (priceData.symbol === symbol) {
                dispatch(addPrice(priceData));
            }
        };

        return () => {
            ws.close();
        };
    }, [symbol, dispatch]);

    return (
        <div>
            <h1>Real-Time Price Data</h1>
            <table>
                <thead>
                    <tr>
                        <th>Price</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {prices.map((price, index) => (
                        <tr key={index}>
                            <td>{price.price}</td>
                            <td>{new Date(price.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => dispatch(setSymbol(prompt('Enter symbol:') || symbol))}>
                Change Symbol
            </button>
        </div>
    );
};

export default Home;
