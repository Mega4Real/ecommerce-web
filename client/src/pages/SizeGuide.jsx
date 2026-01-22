import React from 'react';
import './SizeGuide.css';

const SizeGuide = () => {
  return (
    <div className="size-guide">
      <h1>Size Guide</h1>
      <p>Find your perfect fit with our size guide.</p>
      <h2>Women's Clothing</h2>
      <table className="size-table">
        <thead>
          <tr>
            <th>Size</th>
            <th>Bust (cm)</th>
            <th>Waist (cm)</th>
            <th>Hips (cm)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>XS</td>
            <td>80-84</td>
            <td>60-64</td>
            <td>86-90</td>
          </tr>
          <tr>
            <td>S</td>
            <td>84-88</td>
            <td>64-68</td>
            <td>90-94</td>
          </tr>
          <tr>
            <td>M</td>
            <td>88-92</td>
            <td>68-72</td>
            <td>94-98</td>
          </tr>
          <tr>
            <td>L</td>
            <td>92-96</td>
            <td>72-76</td>
            <td>98-102</td>
          </tr>
          <tr>
            <td>XL</td>
            <td>96-100</td>
            <td>76-80</td>
            <td>102-106</td>
          </tr>
        </tbody>
      </table>
      <p className="note">Please note that these measurements are approximate and may vary slightly depending on the style and fit of the garment.</p>
    </div>
  );
};

export default SizeGuide;
