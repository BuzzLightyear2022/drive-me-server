export type Users = {
    id?: number,
    username: string,
    hashed_password: string
}

export type VehicleAttributes = {
    id?: number,
    imageFileName?: string,
    carModel: string,
    modelCode: string,
    nonSmoking: boolean,
    insurancePriority: boolean,
    licensePlateRegion: string,
    licensePlateCode: string,
    licensePlateHiragana: string,
    licensePlateNumber: string,
    bodyColor: string,
    driveType: string,
    transmission: string,
    rentalClass: string,
    navigation: string,
    hasBackCamera: boolean,
    hasDVD: boolean,
    hasTelevision: boolean,
    hasExternalInput: boolean,
    hasSpareKey: boolean,
    hasJAFCard: boolean,
    JAFCardNumber?: number,
    JAFCardExp?: Date,
    otherFeatures?: string
}

export type ReservationData = {
    id?: number,
    vehicleId: string,
    reservationName: string,
    rentalCategory: string,
    pickupLocation: string,
    returnLocation: string,
    pickupDateObject: Date,
    returnDateObject: Date,
    nonSmoking: string,
    comment?: string
}

export type VehicleStatuses = {
    id?: number,
    vehicleId: number,
    currentLocation: string,
    isWashed: boolean,
    createdAt: Date,
    updatedAt: Date
}

export type CarCatalog = {
    rentalClass: {
        [rentalClassName: string]: {
            [carModel: string]: {
                modelCode?: string[],
                driveType?: string[],
                transmission?: string[],
                bodyColor?: string[]
            }
        }
    }
}

export type LicensePlatesData = {
    id: number,
    licensePlate: string
}

export interface FilesObject {
    [fieldname: string]: Express.Multer.File[];
}