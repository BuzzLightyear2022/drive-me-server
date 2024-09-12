export type User = {
    id?: number,
    username: string,
    hashed_password: string,
    failed_attempts: number,
    is_locked: boolean,
    mfa_secret?: string,
    mfa_enabled: boolean,
    mfa_timestamp?: number,
    role: "admin" | "employee" | "part-time",
    createdAt?: Date,
    updatedAt?: Date
}

export type RentalCar = {
    id?: number,
    imageFileName?: string | null,
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
    createdAt: datetime,
    updatedAt: datetime
}

export type Reservation = {
    id?: number
    isReplied: boolean,
    receptionDate: Date,
    repliedDatetime: Date,
    salesBranch: string,
    orderHandler: string,
    orderSource: string,
    userNameFurigana: string,
    nonSmoking: string,
    userName: string,
    preferredRentalClass: string,
    isElevatable: boolean,
    isClassSpecified: boolean,
    applicantName: string,
    preferredCarModel: string,
    applicantZipCode: number,
    applicantAddress: string,
    applicantPhoneNumber: number,
    pickupLocation: string,
    returnLocation: string,
    pickupDatetime: Datetime,
    arrivalFlightCarrier: string,
    arrivalFlightNumber: number,
    arrivalFlightTime: time,
    returnDatetime: Datetime,
    departureFlightCarrier: string,
    departureFlightNumber: number,
    departureFlightTime: time,
    selectedRentalClass: string,
    selectedCarModel: string,
    selectedVehicleId: number,
    comment: string,
    isCanceled: boolean,
    cancelComment: string,
    scheduleBarColor: string,
    createdAt: datetime,
    updatedAt: datetime
}

export type LoanerRentalReservation = {
    id?: string,
    receptionDate: Date,
    receptionBranch: string,
    receptionHandler: string,
    clientName: string,
    contactPersonName: string,
    nonSmoking: string,
    userName1: string,
    usingCarModel: string,
    contactType: string,
    phoneNumberFirst: string,
    phoneNumberSecond: string,
    phoneNumberThird: string,
    dispatchDatetime: Date,
    dispatchLocation: string,
    remarks: string,
    insuranceProvider: string,
    insuranceProviderCoordinator: string,
    insuranceProviderPhone: string,
    repairFacility: string,
    repairFacilityRepresentative: string,
    repairFacilityPhone: string,
    caseNumber: string,
    accidentDate: Date,
    policyNumber: string,
    coverageCategory: string,
    dailyAmount: number,
    recompense: boolean,
    policyholderName: string,
    userName2: string,
    pickupLocation: string,
    ownedCar: string,
    transportLocation: string,
    limitDate: Date,
    selectedRentalClass: string,
    selectedCarModel: string,
    selectedRentalcarId: string,
    scheduleBarColor: string,
    isCanceled: boolean
}

export type RentalCarStatus = {
    id?: number,
    rentalCarId: number,
    currentLocation: string,
    washState: string,
    comment: string,
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