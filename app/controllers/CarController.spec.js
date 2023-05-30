const { Car } = require("../models");
const dayjs = require("dayjs");
const CarController = require("./CarController");

describe("CarController", () => {
  describe("#handleListCars", () => {
    it("res.status(200) and res.json cars list data", async () => {
      const mockRequest = {
        query: {},
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockCarLists = [];

      const mockCar = {
        id: 3,
        name: "mclaren",
        price: 12000.5,
        size: "small",
        image: "gambar-mobil.jpg",
        isCurrentlyRented: false,
        createdAt: "2022-01-01T07:08:01.871Z",
        updatedAt: "2022-01-01T07:08:01.871Z",
        userCar: null,
      };

      for (let i = 0; i < 10; i++) {
        mockCarLists.push({
          ...mockCar,
          id: i + 1,
        });
      }

      const mockCarModel = {
        findAll: jest.fn().mockReturnValue(mockCarLists),
        count: jest.fn().mockReturnValue(10),
      };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: {},
        dayjs,
      });
      await carController.handleListCars(mockRequest, mockResponse);

      const expectedPagination = carController.buildPaginationObject(
        mockRequest,
        10
      );

      expect(mockCarModel.findAll).toHaveBeenCalled();
      expect(mockCarModel.count).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        cars: mockCarLists,
        meta: {
          pagination: expectedPagination,
        },
      });
    });
  });

  describe("#handleCreateCar", () => {
    it("res.status(201) and res.json car instance", async () => {
      const name = "pick-up";
      const price = 12000.5;
      const size = "medium";
      const image = "pickup.jpg";

      const mockRequest = {
        body: {
          name,
          price,
          size,
          image,
        },
      };

      const car = new Car({ name, price, size, image });
      const mockCarModel = { create: jest.fn().mockReturnValue(car) };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });

      await carController.handleCreateCar(mockRequest, mockResponse);

      expect(mockCarModel.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(car);
    });

    it("res.status(422) and res.json car instance", async () => {
      const err = new Error("error");
      const name = "pick-up";
      const price = 12000.5;
      const size = "medium";
      const image = "pickup.jpg";
      const isCurrentlyRented = false;

      const mockRequest = {
        body: {
          name,
          price,
          size,
          image,
          isCurrentlyRented,
        },
      };

      const mockCarModel = {
        create: jest.fn().mockReturnValue(Promise.reject(err)),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });

      await carController.handleCreateCar(mockRequest, mockResponse);

      expect(mockCarModel.create).toHaveBeenCalledWith({
        name,
        price,
        size,
        image,
        isCurrentlyRented,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
        },
      });
    });
  });

  describe("#handleRentCar", () => {
    it("res.status(201) and res.json user car instance", async () => {
      const rentStartedAt = new Date().toISOString();
      const rentEndedAt = dayjs(rentStartedAt).add(1, "day");

      const mockRequest = {
        body: {
          rentStartedAt,
          rentEndedAt: null,
        },
        params: {
          id: 3,
        },
        user: {
          id: 3,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const mockCar = {
        id: 3,
        name: "pick-up",
        price: 12000.5,
        size: "medium",
        image: "pickup.jpg",
        isCurrentlyRented: false,
        createdAt: "2022-11-28T08:02:01.861Z",
        updatedAt: "2022-11-28T08:02:01.861Z",
        userCar: null,
      };

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockUserCar = {
        id: 3,
        userId: 3,
        carId: 3,
        rentStartedAt: null,
        rentEndedAt: null,
        createdAt: null,
        updatedAt: null,
      };

      const mockUserCarModel = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue({
          ...mockUserCar,
          rentStartedAt,
          rentEndedAt,
        }),
      };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });
      await carController.handleRentCar(mockRequest, mockResponse, mockNext);

      expect(mockUserCarModel.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        ...mockUserCar,
        rentStartedAt,
        rentEndedAt,
      });
    });
  });

  describe("#handleUpdateCar", () => {
    it("res.status(201) and res.json car data", async () => {
      const name = "pick-up";
      const price = 12000.5;
      const size = "medium";
      const image = "pickup.jpg";
      const isCurrentlyRented = false;

      const mockrequest = {
        params: {
          id: 3,
        },
        body: {
          name,
          price,
          size,
          image,
          isCurrentlyRented,
        },
      };

      const mockCar = new Car({ name, price, size, image, isCurrentlyRented });
      mockCar.update = jest.fn().mockReturnThis();

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const carController = new CarController({ carModel: mockCarModel });
      await carController.handleUpdateCar(mockrequest, mockResponse);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(3);
      expect(mockCar.update).toHaveBeenCalledWith({
        name,
        price,
        size,
        image,
        isCurrentlyRented,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe("#handleDeleteCar", () => {
    it("res.status(204)", async () => {
      const name = "pick-up";
      const price = 12000.5;
      const size = "medium";
      const image = "pickup.jpg";
      const isCurrentlyRented = false;

      const mockRequest = {
        params: {
          id: 3,
        },
      };

      const mockCar = new Car({ name, price, size, image, isCurrentlyRented });
      mockCar.destroy = jest.fn();

      const mockResponse = {};
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.end = jest.fn().mockReturnThis();

      const carController = new CarController({ carModel: mockCar });
      await carController.handleDeleteCar(mockRequest, mockResponse);

      expect(mockCar.destroy).toHaveBeenCalledWith(3);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });
});
