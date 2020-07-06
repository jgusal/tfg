import pyeto
from sklearn.ensemble import RandomForestRegressor
from sklearn.ensemble import GradientBoostingRegressor
import pickle
import json
import numpy as np

class Recommendator:
    def __init__(self):
        self.gbr_model = None
        self.rfr_model = None

    def load_model(model_name):
        path = 'models/' + model_name + '.pickle'
        with open(path , 'rb') as model:
            return pickle.load(model)

    def hargreaves(self, day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef):
        def calculate_extraterrestial_radiation(latitude, day):
            # Calculate solar declination
            solar_declination = pyeto.sol_dec(day)
            # Calculate sunset hour angle
            sunset_hour_angle = pyeto.sunset_hour_angle(latitude, solar_declination)
            # Calculate inverse relative distance earth-sun
            inverse_relative_distance = pyeto.inv_rel_dist_earth_sun(day)
            # Calculate extraterrestial radiation
            extraterrestial_radiation = pyeto.et_rad(latitude, solar_declination,
                sunset_hour_angle, inverse_relative_distance)

            return extraterrestial_radiation

        # Calculate extraterrestial radiation
        extraterrestial_radiation = calculate_extraterrestial_radiation(latitude, day)
        # Calculate evapotranspiration
        ETo = pyeto.hargreaves(tmin, tmax, tmean, extraterrestial_radiation)
        # Predict irrigation
        prediction = (ETo * Kc - precipitation) / Ef

        return prediction > 0

    def rfr(self, day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef):
        # Load model if it has not been loaded yet
        if not self.rfr_model:
            self.rfr_model = Recommendator.load_model('rfr')

        return self.rfr_model.predict( np.array((day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef)).reshape((1, -1)) ) > 0

    def gbr(self, day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef):
        # Load model if it has not been loaded yet
        if not self.gbr_model:
            self.gbr_model = Recommendator.load_model('gbr')

        return self.gbr_model.predict(np.array((day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef)).reshape((1, -1))) > 0

    def __call__(self, day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef):
        results = {}

        results["hargreaves"] = self.hargreaves(day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef)
        results["rfr"] = bool(self.rfr(day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef)[0])
        results["gbr"] = bool(self.gbr(day, tmax, tmin, tmean, latitude, precipitation, Kc, Ef)[0])

        return results
